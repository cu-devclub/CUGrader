import { useEffect, useRef, useState, useCallback } from 'react';

// Global effect stack for tracking dependencies
const effectStack: Effect[] = [];
let currentEffect: Effect | null = null;
let currentOwner: EffectOwner | null = null;

// Effect owner for scoped cleanup and lifecycle management
export interface EffectOwner {
  effects: Set<Effect>;
  cleanup(): void;
  isDisposed: boolean;
}

// Effect type for dependency tracking
type Effect = {
  fn: () => void;
  deps: Set<Signal<any>>;
  cleanup?: () => void;
  owner?: EffectOwner;
};

// Signal interface
export interface Signal<T> {
  value: T;
  readonly deps: Set<Effect>;
  peek(): T;
  set(value: T): void;
  update(updater: (prev: T) => T): void;
  subscribe(callback: (value: T) => void): () => void;
}

// Global batch state for diamond problem resolution
let batchDepth = 0;
let batchedSignals = new Set<Signal<any>>();
let pendingEffects = new Set<Effect>();

// Create an effect owner scope
export function createEffectOwner(): EffectOwner {
  const owner: EffectOwner = {
    effects: new Set(),
    isDisposed: false,
    cleanup() {
      if (this.isDisposed) return;
      
      this.effects.forEach(effect => {
        if (effect.cleanup) {
          effect.cleanup();
        }
        // Remove effect from all signal dependencies
        effect.deps.forEach(sig => sig.deps.delete(effect));
        effect.deps.clear();
      });
      
      this.effects.clear();
      this.isDisposed = true;
    }
  };
  
  return owner;
}

// Run function with effect owner scope
export function withOwner<T>(owner: EffectOwner, fn: () => T): T {
  if (owner.isDisposed) {
    throw new Error('Cannot use disposed effect owner');
  }
  
  const oldOwner = currentOwner;
  currentOwner = owner;
  
  try {
    return fn();
  } finally {
    currentOwner = oldOwner;
  }
}

// Enhanced signal creation with diamond dependency resolution
export function signal<T>(initialValue: T): Signal<T> {
  const deps = new Set<Effect>();
  let _value = initialValue;

  const triggerEffects = () => {
    if (batchDepth > 0) {
      // In batch mode - collect effects
      deps.forEach(effect => pendingEffects.add(effect));
      return;
    }
    
    // Immediate mode - execute with diamond resolution
    const effectsToRun = new Set<Effect>();
    const visited = new Set<Effect>();
    const visiting = new Set<Effect>();
    const sortedEffects: Effect[] = [];
    
    // Collect all transitively dependent effects
    const collectEffects = (startEffects: Set<Effect>) => {
      startEffects.forEach(effect => {
        if (!effectsToRun.has(effect)) {
          effectsToRun.add(effect);
          // Find effects that depend on this effect's dependencies
          effect.deps.forEach(sig => {
            sig.deps.forEach(transitiveEffect => {
              if (transitiveEffect !== effect) {
                collectEffects(new Set([transitiveEffect]));
              }
            });
          });
        }
      });
    };
    
    collectEffects(deps);
    
    // Topological sort to resolve diamond dependencies
    const visit = (effect: Effect) => {
      if (visiting.has(effect)) return; // Circular dependency
      if (visited.has(effect)) return;
      
      visiting.add(effect);
      
      // Visit effects that this effect depends on first
      effect.deps.forEach(sig => {
        sig.deps.forEach(dependentEffect => {
          if (dependentEffect !== effect && effectsToRun.has(dependentEffect)) {
            visit(dependentEffect);
          }
        });
      });
      
      visiting.delete(effect);
      visited.add(effect);
      sortedEffects.push(effect);
    };
    
    effectsToRun.forEach(visit);
    
    // Execute in dependency order
    sortedEffects.forEach(effect => {
      try {
        effect.fn();
      } catch (error) {
        console.error('Effect error:', error);
      }
    });
  };

  const sig: Signal<T> = {
    get value() {
      // Track dependency if we're inside an effect
      if (currentEffect) {
        deps.add(currentEffect);
        currentEffect.deps.add(sig);
      }
      return _value;
    },

    set value(newValue: T) {
      if (_value !== newValue) {
        _value = newValue;
        triggerEffects();
      }
    },

    deps,

    peek(): T {
      return _value;
    },

    set(value: T): void {
      sig.value = value;
    },

    update(updater: (prev: T) => T): void {
      sig.value = updater(_value);
    },

    subscribe(callback: (value: T) => void): () => void {
      const effect: Effect = {
        fn: () => callback(_value),
        deps: new Set([sig]),
        owner: currentOwner || undefined
      };
      
      deps.add(effect);
      
      // Register with current owner if exists
      if (currentOwner && !currentOwner.isDisposed) {
        currentOwner.effects.add(effect);
      }
      
      return () => {
        deps.delete(effect);
        if (effect.owner) {
          effect.owner.effects.delete(effect);
        }
      };
    }
  };

  return sig;
}

// Computed signal that derives from other signals
export function computed<T>(fn: () => T): Signal<T> {
  const sig = signal<T>(undefined as any);
  
  const effect: Effect = {
    fn: () => {
      const oldEffect = currentEffect;
      currentEffect = effect;
      
      try {
        // Clear old dependencies
        effect.deps.forEach(dep => dep.deps.delete(effect));
        effect.deps.clear();
        
        // Compute new value and track dependencies
        const newValue = fn();
        sig.set(newValue);
      } finally {
        currentEffect = oldEffect;
      }
    },
    deps: new Set(),
    owner: currentOwner || undefined
  };

  // Register with current owner if exists
  if (currentOwner && !currentOwner.isDisposed) {
    currentOwner.effects.add(effect);
  }

  // Run initial computation
  effect.fn();

  return {
    ...sig,
    set(): void {
      throw new Error('Cannot set computed signal directly');
    },
    update(): void {
      throw new Error('Cannot update computed signal directly');
    }
  };
}

// Effect function for side effects
export function effect(fn: () => void | (() => void)): () => void {
  const eff: Effect = {
    fn: () => {
      // Check if owner is disposed
      if (eff.owner?.isDisposed) {
        return;
      }
      
      // Cleanup previous effect
      if (eff.cleanup) {
        eff.cleanup();
        eff.cleanup = undefined;
      }

      const oldEffect = currentEffect;
      currentEffect = eff;

      try {
        // Clear old dependencies
        eff.deps.forEach(dep => dep.deps.delete(eff));
        eff.deps.clear();

        // Run effect and track dependencies
        const cleanup = fn();
        if (typeof cleanup === 'function') {
          eff.cleanup = cleanup;
        }
      } finally {
        currentEffect = oldEffect;
      }
    },
    deps: new Set(),
    owner: currentOwner || undefined
  };

  // Register with current owner if exists
  if (currentOwner && !currentOwner.isDisposed) {
    currentOwner.effects.add(eff);
  }

  // Run initial effect
  eff.fn();

  // Return cleanup function
  return () => {
    if (eff.cleanup) {
      eff.cleanup();
    }
    eff.deps.forEach(dep => dep.deps.delete(eff));
    eff.deps.clear();
    
    if (eff.owner) {
      eff.owner.effects.delete(eff);
    }
  };
}

// React hook to use signals in components with automatic cleanup
export function useSignal<T>(sig: Signal<T>): T {
  const [, forceUpdate] = useState({});
  const cleanupRef = useRef<(() => void) | null>(null);
  const ownerRef = useRef<EffectOwner | null>(null);

  // Create component-scoped owner on first render
  if (!ownerRef.current) {
    ownerRef.current = createEffectOwner();
  }

  useEffect(() => {
    const owner = ownerRef.current!;
    
    // Subscribe to signal changes within owner scope
    cleanupRef.current = withOwner(owner, () =>
      sig.subscribe(() => {
        forceUpdate({});
      })
    );

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [sig]);

  // Cleanup owner on unmount
  useEffect(() => {
    return () => {
      if (ownerRef.current) {
        ownerRef.current.cleanup();
      }
    };
  }, []);

  return sig.value;
}

// React hook to create a signal that persists across renders
export function useSignalState<T>(initialValue: T): Signal<T> {
  const sigRef = useRef<Signal<T> | null>(null);
  
  if (!sigRef.current) {
    sigRef.current = signal(initialValue);
  }

  return sigRef.current;
}

// React hook for computed values with owner scope
export function useComputed<T>(fn: () => T, deps: any[] = []): T {
  const computedRef = useRef<Signal<T> | null>(null);
  const ownerRef = useRef<EffectOwner | null>(null);
  const [, forceUpdate] = useState({});

  // Create component-scoped owner on first render
  if (!ownerRef.current) {
    ownerRef.current = createEffectOwner();
  }

  useEffect(() => {
    const owner = ownerRef.current!;
    
    // Create computed within owner scope
    computedRef.current = withOwner(owner, () => computed(fn));
    
    const cleanup = computedRef.current.subscribe(() => {
      forceUpdate({});
    });

    return cleanup;
  }, deps);

  // Cleanup owner on unmount
  useEffect(() => {
    return () => {
      if (ownerRef.current) {
        ownerRef.current.cleanup();
      }
    };
  }, []);

  return computedRef.current?.value ?? fn();
}

// React hook for effects with owner scope
export function useEffect2(fn: () => void | (() => void), deps: any[] = []): void {
  const cleanupRef = useRef<(() => void) | null>(null);
  const ownerRef = useRef<EffectOwner | null>(null);

  // Create component-scoped owner on first render
  if (!ownerRef.current) {
    ownerRef.current = createEffectOwner();
  }

  useEffect(() => {
    const owner = ownerRef.current!;
    
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    
    // Create effect within owner scope
    cleanupRef.current = withOwner(owner, () => effect(fn));

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, deps);

  // Cleanup owner on unmount
  useEffect(() => {
    return () => {
      if (ownerRef.current) {
        ownerRef.current.cleanup();
      }
    };
  }, []);
}

// Batch updates to prevent excessive re-renders and resolve diamond dependencies
export function batch(fn: () => void): void {
  if (batchDepth > 0) {
    // Already in batch mode, just execute
    fn();
    return;
  }
  
  batchDepth++;
  batchedSignals.clear();
  pendingEffects.clear();
  
  try {
    fn();
    
    // Execute all collected effects with diamond resolution
    if (pendingEffects.size > 0) {
      const visited = new Set<Effect>();
      const visiting = new Set<Effect>();
      const sortedEffects: Effect[] = [];
      
      const visit = (effect: Effect) => {
        if (visiting.has(effect)) return; // Circular dependency
        if (visited.has(effect)) return;
        
        visiting.add(effect);
        
        // Visit dependencies first
        effect.deps.forEach(sig => {
          sig.deps.forEach(dep => {
            if (dep !== effect && pendingEffects.has(dep)) {
              visit(dep);
            }
          });
        });
        
        visiting.delete(effect);
        visited.add(effect);
        sortedEffects.push(effect);
      };
      
      pendingEffects.forEach(visit);
      
      // Execute in dependency order
      sortedEffects.forEach(effect => {
        try {
          effect.fn();
        } catch (error) {
          console.error('Batched effect error:', error);
        }
      });
    }
  } finally {
    batchDepth--;
    batchedSignals.clear();
    pendingEffects.clear();
  }
}

// Utility to create reactive refs for objects
export function reactive<T extends object>(obj: T): T {
  const signals = new Map<string | symbol, Signal<any>>();
  const updateQueue = new Set<Effect>();
  let isUpdating = false;
  
  const flushUpdates = () => {
    if (isUpdating) return;
    isUpdating = true;
    
    // Topological sort to resolve diamond dependencies
    const visited = new Set<Effect>();
    const temp = new Set<Effect>();
    const sorted: Effect[] = [];
    
    const visit = (effect: Effect) => {
      if (temp.has(effect)) return; // Circular dependency
      if (visited.has(effect)) return;
      
      temp.add(effect);
      
      // Visit dependencies first
      effect.deps.forEach(sig => {
        sig.deps.forEach(dep => {
          if (dep !== effect) visit(dep);
        });
      });
      
      temp.delete(effect);
      visited.add(effect);
      sorted.push(effect);
    };
    
    updateQueue.forEach(visit);
    
    // Execute in topological order
    sorted.forEach(effect => {
      try {
        effect.fn();
      } catch (error) {
        console.error('Effect error:', error);
      }
    });
    
    updateQueue.clear();
    isUpdating = false;
  };
  
  return new Proxy(obj, {
    get(target, prop) {
      if (!signals.has(prop)) {
        signals.set(prop, signal((target as any)[prop]));
      }
      return signals.get(prop)!.value;
    },
    
    set(target, prop, value) {
      if (!signals.has(prop)) {
        const sig = signal(value);
        signals.set(prop, sig);
        
        // Override signal's update mechanism for batching
        const originalSet = sig.set.bind(sig);
        sig.set = (newValue: any) => {
          if (sig.peek() !== newValue) {
            (sig as any)._value = newValue;
            sig.deps.forEach(effect => updateQueue.add(effect));
            
            // Schedule flush
            Promise.resolve().then(flushUpdates);
          }
        };
      } else {
        signals.get(prop)!.set(value);
      }
      (target as any)[prop] = value;
      return true;
    }
  });
}

// Utility to convert signal to readonly
export function readonly<T>(sig: Signal<T>): Omit<Signal<T>, 'set' | 'update'> {
  return {
    get value() { return sig.value; },
    deps: sig.deps,
    peek: () => sig.peek(),
    subscribe: (callback) => sig.subscribe(callback)
  };
}
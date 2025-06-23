import React from 'react';
import { 
  signal, 
  computed, 
  useSignal, 
  useSignalState, 
  useComputed, 
  useEffect2,
  reactive,
  batch
} from '../lib/signal';

// Example: Counter with signals
const globalCounter = signal(0);
const doubledCounter = computed(() => globalCounter.value * 2);

export function CounterExample() {
  const count = useSignal(globalCounter);
  const doubled = useSignal(doubledCounter);
  
  return (
    <div className="p-4 border rounded">
      <h3>Global Counter Example</h3>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button 
        onClick={() => globalCounter.update(c => c + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
      >
        Increment
      </button>
      <button 
        onClick={() => globalCounter.set(0)}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Reset
      </button>
    </div>
  );
}

// Example: Local component state with signals
export function LocalStateExample() {
  const localCount = useSignalState(0);
  const count = useSignal(localCount);
  
  // Computed value using React hook
  const isEven = useComputed(() => count % 2 === 0);
  
  // Effect that runs when count changes
  useEffect2(() => {
    console.log(`Count changed to: ${count}`);
    
    // Return cleanup function (optional)
    return () => {
      console.log(`Cleaning up effect for count: ${count}`);
    };
  }, [count]);
  
  return (
    <div className="p-4 border rounded mt-4">
      <h3>Local State Example</h3>
      <p>Count: {count}</p>
      <p>Is Even: {isEven ? 'Yes' : 'No'}</p>
      <button 
        onClick={() => localCount.update(c => c + 1)}
        className="px-4 py-2 bg-green-500 text-white rounded mr-2"
      >
        Increment
      </button>
      <button 
        onClick={() => localCount.set(0)}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Reset
      </button>
    </div>
  );
}

// Example: Reactive object
const user = reactive({
  name: 'John',
  age: 30,
  email: 'john@example.com'
});

export function ReactiveObjectExample() {
  const userName = useSignal(signal(user.name));
  const userAge = useSignal(signal(user.age));
  
  return (
    <div className="p-4 border rounded mt-4">
      <h3>Reactive Object Example</h3>
      <p>Name: {userName}</p>
      <p>Age: {userAge}</p>
      <input 
        type="text"
        value={userName}
        onChange={(e) => user.name = e.target.value}
        className="border px-2 py-1 mr-2"
        placeholder="Name"
      />
      <input 
        type="number"
        value={userAge}
        onChange={(e) => user.age = parseInt(e.target.value)}
        className="border px-2 py-1"
        placeholder="Age"
      />
    </div>
  );
}

// Example: Complex state management
const todoStore = {
  todos: signal<Array<{id: number, text: string, completed: boolean}>>([]),
  filter: signal<'all' | 'active' | 'completed'>('all'),
  
  // Computed values
  get filteredTodos() {
    return computed(() => {
      const todos = this.todos.value;
      const filter = this.filter.value;
      
      switch (filter) {
        case 'active':
          return todos.filter(todo => !todo.completed);
        case 'completed':
          return todos.filter(todo => todo.completed);
        default:
          return todos;
      }
    });
  },
  
  get stats() {
    return computed(() => {
      const todos = this.todos.value;
      return {
        total: todos.length,
        active: todos.filter(t => !t.completed).length,
        completed: todos.filter(t => t.completed).length
      };
    });
  },
  
  // Actions
  addTodo(text: string) {
    this.todos.update(todos => [
      ...todos,
      { id: Date.now(), text, completed: false }
    ]);
  },
  
  toggleTodo(id: number) {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  },
  
  removeTodo(id: number) {
    this.todos.update(todos => todos.filter(todo => todo.id !== id));
  },
  
  setFilter(filter: 'all' | 'active' | 'completed') {
    this.filter.set(filter);
  }
};

export function TodoExample() {
  const todos = useSignal(todoStore.filteredTodos);
  const stats = useSignal(todoStore.stats);
  const filter = useSignal(todoStore.filter);
  const [newTodo, setNewTodo] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      todoStore.addTodo(newTodo.trim());
      setNewTodo('');
    }
  };
  
  return (
    <div className="p-4 border rounded mt-4">
      <h3>Todo Store Example</h3>
      
      {/* Stats */}
      <div className="mb-4 text-sm text-gray-600">
        Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}
      </div>
      
      {/* Add todo form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a todo..."
          className="border px-2 py-1 mr-2 flex-1"
        />
        <button 
          type="submit"
          className="px-4 py-1 bg-blue-500 text-white rounded"
        >
          Add
        </button>
      </form>
      
      {/* Filter buttons */}
      <div className="mb-4">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => todoStore.setFilter(f)}
            className={`px-3 py-1 mr-2 rounded ${
              filter === f 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Todo list */}
      <div className="space-y-2">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => todoStore.toggleTodo(todo.id)}
            />
            <span className={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.text}
            </span>
            <button
              onClick={() => todoStore.removeTodo(todo.id)}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example: Batch updates
export function BatchExample() {
  const x = useSignalState(0);
  const y = useSignalState(0);
  const xVal = useSignal(x);
  const yVal = useSignal(y);
  
  const sum = useComputed(() => xVal + yVal);
  
  const handleBatchUpdate = () => {
    batch(() => {
      x.set(Math.random() * 100);
      y.set(Math.random() * 100);
    });
  };
  
  return (
    <div className="p-4 border rounded mt-4">
      <h3>Batch Update Example</h3>
      <p>X: {xVal}</p>
      <p>Y: {yVal}</p>
      <p>Sum: {sum}</p>
      <button
        onClick={handleBatchUpdate}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Batch Update Both
      </button>
    </div>
  );
}

// Main component that demonstrates all examples
export default function SignalExamples() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Signal-Based Reactivity Examples</h1>
      
      <CounterExample />
      <LocalStateExample />
      <ReactiveObjectExample />
      <TodoExample />
      <BatchExample />
    </div>
  );
}

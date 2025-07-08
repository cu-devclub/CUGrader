

def add_num(a, b):
    return a / b

import unittest

class MyTest(unittest.TestCase):
    def test_hello_world(self):
        self.assertEqual(add_num(1, 2), 0.5)

    def test_hello_world2(self):
        self.assertEqual(add_num(1, 2), 2)

    def test_hello_world3(self):
        self.assertEqual(add_num(1, 2), 0.5)

    # def test_hello_world4(self):
    #     self.assertEqual(add_num(1, 2), 0.5)

    # def test_hello_world5(self):
    #     self.assertEqual(add_num(1, 2), 0.5)

    # def test_hello_world6(self):
    #     self.assertEqual(add_num(1, 0), 3)



test_result = unittest.main(verbosity=1, exit=False)
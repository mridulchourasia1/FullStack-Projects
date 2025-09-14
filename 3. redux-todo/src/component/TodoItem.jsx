import React from 'react';

const TodoItem = ({ todo, onToggleTodo, onDeleteTodo }) => {
  return (
    <li style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
      <span onClick={() => onToggleTodo(todo.id)} style={{ cursor: 'pointer' }}>
        {todo.text}
      </span>
      <button onClick={() => onDeleteTodo(todo.id)} style={{ marginLeft: '10px' }}>
        Delete
      </button>
    </li>
  );
};

export default TodoItem;

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { IoMdMedkit } from "react-icons/io";
import {
  FaTrash,
  FaShoppingCart,
  FaWrench,
  FaUtensils,
  FaFileAlt,
  FaDollarSign,
} from "react-icons/fa";

import "./App.css";

const categoryIcons = {
  shopping: {
    icon: <FaShoppingCart />,
    count: 0,
  },
  medical: {
    icon: <IoMdMedkit />,
    count: 0,
  },
  maintenance: {
    icon: <FaWrench />,
    count: 0,
  },
  cooking: {
    icon: <FaUtensils />,
    count: 0,
  },
  document: {
    icon: <FaFileAlt />,
    count: 0,
  },
  banking: {
    icon: <FaDollarSign />,
    count: 0,
  },
};

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [category, setCategory] = useState("shopping");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else {
        throw new Error("Error fetching tasks");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const updateCategoryIcons = () => {
    const updatedIcons = { ...categoryIcons };
    Object.keys(updatedIcons).forEach((key) => {
      updatedIcons[key].count = todos.filter(
        (task) => task.category === key && !task.completed
      ).length;
    });
    return updatedIcons;
  };

  const handleTaskChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length <= 14) {
      setTask(inputText);
    }
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const handleAddTask = async () => {
    if (task.trim() !== "") {
      const newTask = {
        id: uuidv4(),
        task: task.trim(),
        completed: false,
        category: category,
      };

      try {
        const response = await fetch("http://localhost:5000/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        });

        if (response.ok) {
          setTodos((prevTodos) => [...prevTodos, newTask]);
          setTask("");
        } else {
          throw new Error("Error adding task");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setTodos((prevTodos) => prevTodos.filter((task) => task.id !== taskId));
      } else {
        throw new Error("Error deleting task");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const taskToUpdate = todos.find((task) => task.id === taskId);
      const updatedTask = {
        ...taskToUpdate,
        completed: !taskToUpdate.completed,
      };

      const response = await fetch(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTask),
        }
      );

      if (response.ok) {
        setTodos((prevTodos) =>
          prevTodos.map((task) => (task.id === taskId ? updatedTask : task))
        );
      } else {
        throw new Error("Error updating task");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const categoryIconsState = updateCategoryIcons();

  return (
    <div className="app">
      <h1>Todo App</h1>
      <div className="category-icons">
        {Object.keys(categoryIconsState).map((key) => (
          <span
            key={key}
            className={`category-icon ${category === key ? "active" : ""}`}
            onClick={() => handleCategoryChange(key)}
          >
            {categoryIconsState[key].icon}
            {categoryIconsState[key].count > 0 && (
              <span className="category-badge">
                {categoryIconsState[key].count}
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="todo-container">
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter task"
            value={task}
            onChange={handleTaskChange}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleAddTask}>Add Task</button>
        </div>
        <ul className="task-list">
          {todos.map(
            (task) =>
              task.category === category && (
                <li key={task.id} className={task.completed ? "completed" : ""}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                  />
                  <span className="task-text">{task.task}</span>
                  <FaTrash
                    className={`delete-icon ${task.completed ? "enabled" : ""}`}
                    onClick={() => handleDeleteTask(task.id)}
                  />
                </li>
              )
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;

const pool = require("../index").pool;

class TaskModel {
  static async getAllTasks() {
    try {
      const query = "SELECT * FROM tasks";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error("Error retrieving tasks");
    }
  }

  static async createTask(taskData) {
    try {
      const { task, completed, category } = taskData;
      const query =
        "INSERT INTO tasks (task, completed, category) VALUES ($1, $2, $3) RETURNING *";
      const result = await pool.query(query, [task, completed, category]);
      return result.rows[0];
    } catch (error) {
      throw new Error("Error creating task");
    }
  }

  static async updateTask(taskId, taskData) {
    try {
      const { task, completed, category } = taskData;
      const query =
        "UPDATE tasks SET task = $1, completed = $2, category = $3 WHERE id = $4 RETURNING *";
      const result = await pool.query(query, [
        task,
        completed,
        category,
        taskId,
      ]);
      if (result.rows.length === 0) {
        throw new Error("Task not found");
      }
      return result.rows[0];
    } catch (error) {
      if (error.message === "Task not found") {
        throw error;
      } else {
        throw new Error("Error updating task");
      }
    }
  }

  static async deleteTask(taskId) {
    try {
      const query = "DELETE FROM tasks WHERE id = $1 RETURNING *";
      const result = await pool.query(query, [taskId]);
      if (result.rows.length === 0) {
        throw new Error("Task not found");
      }
      return result.rows[0];
    } catch (error) {
      if (error.message === "Task not found") {
        throw error;
      } else {
        throw new Error("Error deleting task");
      }
    }
  }
}

module.exports = TaskModel;

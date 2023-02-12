import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { TodoList } from "./../../../types/TodoList";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodoList[] | { success: boolean }>
) {
  if(req.method === "POST") {
    await fetch("https://rpdevelopment-1534606057982-default-rtdb.asia-southeast1.firebasedatabase.app/todolist.json", {
      method: "POST",
      headers: {
        Accept: 'application.json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: uuidv4(),
        todo: req.body.todo,
        isCompleted: false,
        createdAt: Date.now(),
      })
    })
      .then(() => {
        res.status(200).json({ success: true });
      }).catch(e => {
        res.status(500).json({ success: false });
      });
  } else if(req.method === "GET") {
    const todoList: TodoList[] = [];

    await fetch("https://rpdevelopment-1534606057982-default-rtdb.asia-southeast1.firebasedatabase.app/todolist.json")
      .then(res => res.json())
      .then(data => {
        for(const key in data) {
          todoList.push(data[key]);
        }

        res.status(200).json(todoList);
      }).catch(e => {
        res.status(500).json({ success: false });
      });
  }
}

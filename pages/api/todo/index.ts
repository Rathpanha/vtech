import { firebaseConfig } from "@/functions/env";
import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { TodoList } from "./../../../types/TodoList";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodoList[] | { success: boolean, message: string }>
) {
  if(req.method === "POST") {
    const { success, message } = await validateAddingRecord(req.body.todo);

    if(success) {
      const response = await fetch(`${firebaseConfig.databaseURL}/todolist.json`, {
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
      });

      if(response.ok) {
        res.status(200).json({ success: true, message: "Success!" });
      } else {
        res.status(500).json({ success: false, message: "Error while adding record!" });
      }
    } else {
      res.status(400).json({ success, message });
    }
  } else if(req.method === "GET") {
    const todoList: TodoList[] = [];

    const response = await fetch(`${firebaseConfig.databaseURL}/todolist.json`);
  
    if(!response.ok) {
      res.status(500).json({ success: false, message: "Error while retrieving record!" });
    }

    const data = await response.json();
    for(const key in data) {
      todoList.push(data[key]);
    }

    res.status(200).json(todoList);
  }
}

const validateAddingRecord = async (todo: string) => {
  let success = true;
  let message = "";

  // Validate empty
  if(!todo) {
    success = false;
    message = "Record can not be empty!";
  } else {
    // Validate duplicate record
    const response = await fetch(`${firebaseConfig.databaseURL}/todolist.json?orderBy="todo"&equalTo="${todo}"`);

    if(!response.ok) {
      success = false;
      message = "Error while validating record!";
    }

    const data = await response.json();
    if(JSON.stringify(data) !== "{}") {
      success = false;
      message = "Record is duplicated!"
    }
  }

  return { success, message };
}
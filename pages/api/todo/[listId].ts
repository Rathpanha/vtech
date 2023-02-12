import { firebaseConfig } from "@/functions/env";
import type { NextApiRequest, NextApiResponse } from 'next';
import { TodoList } from "./../../../types/TodoList";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodoList[] | { success: boolean, message: string }>
) {
  const { listId } = req.query;

  if(req.method === "DELETE") {
    // Retrieving record to get the value of the key first
    // Because firebase only support deleting by key for REST API
    const { success, message, key } = await gettingRecord(String(listId));

    if(success) {
      // Deleting record by key
      const { success, message } = await deletingRecord(key);

      if(success) {
        res.status(200).json({ success, message });
      } else {
        res.status(500).json({ success, message });
      }
    } else {
      res.status(500).json({ success, message });
    }
  }
}

const gettingRecord = async (listId: string) => {
  let success = true;
  let message = "";
  let key = "";

  const response = await fetch(`${firebaseConfig.databaseURL}/todolist.json?orderBy="id"&equalTo="${listId}"`, {
    method: "GET",
    headers: {
      Accept: 'application.json',
      'Content-Type': 'application/json'
    }
  });
  
  if(response.ok) {
    success = true;
    message = "Success!"
  } else {
    success = false;
    message = "Error while retrieving record to delete!"
  }

  const data = await response.json();
  key = Object.keys(data)[0];

  return { success, message, key };
}

const deletingRecord = async (key: string) => {
  let success = true;
  let message = "";

  const response = await fetch(`${firebaseConfig.databaseURL}/todolist/${key}.json`, {
    method: "DELETE",
    headers: {
      Accept: 'application.json',
      'Content-Type': 'application/json'
    }
  });

  if(response.ok) {
    success = true;
    message = "Success!"
  } else {
    success = false;
    message = "Error while deleting record!"
  }
  
  return { success, message };
}
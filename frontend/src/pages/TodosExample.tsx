import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Todo {
  id: string | number;
  name?: string;
  title?: string;
}

export default function TodosExample() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodos() {
      setLoading(true);
      const { data, error } = await supabase.from("todos").select();
      if (!error && data) {
        setTodos(data);
      }
      setLoading(false);
    }
    fetchTodos();
  }, []);

  if (loading) {
    return <p className="p-4 text-muted-foreground">Loading from Supabase...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-3">Supabase Todos Example</h2>
      {todos.length === 0 ? (
        <p className="text-muted-foreground">No todos found in Supabase.</p>
      ) : (
        <ul className="space-y-2 list-disc list-inside">
          {todos.map((todo) => (
            <li key={todo.id} className="text-foreground">
              {todo.name || todo.title || `Item #${todo.id}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

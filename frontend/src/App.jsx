import { useState, useEffect } from 'react'
import axios from 'axios'

// 백엔드 서버 주소
const API_URL = "/api/todos"

function App() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]); // 처음엔 빈 배열로 시작

  // 1. 화면이 처음 켜질 때 DB에서 데이터 가져오기
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data); // 서버에서 받은 목록 저장
    } catch (err) {
      console.error("데이터 불러오기 실패:", err);
    }
  };

  // 2. 할 일 추가 (DB에 저장)
  const addTodo = async () => {
    if (todo.trim() === "") return;
    try {
      const res = await axios.post(API_URL, { title: todo });
      setTodos([...todos, res.data]); // 서버가 준 새 데이터(ID 포함)를 목록에 추가
      setTodo("");
    } catch (err) {
      alert("추가 실패!");
    }
  };

  // 3. 할 일 삭제 (DB에서 삭제)
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      // 몽고DB는 id가 아니라 _id를 사용하므로 필터링할 때 주의!
      setTodos(todos.filter(item => item._id !== id));
    } catch (err) {
      alert("삭제 실패!");
    }
  };

  // 4. 완료 상태 토글 (서버 DB에도 반영!)
  const toggleTodo = async (id, completed) => {
    try {
      // 서버에 "이 ID 가진 항목의 completed 상태를 반대로 바꿔줘"라고 요청
      const res = await axios.put(`${API_URL}/${id}`, { 
        completed: !completed 
      });
      
      // 서버에서 수정된 데이터를 받아서 화면 업데이트
      setTodos(todos.map(item => item._id === id ? res.data : item));
    } catch (err) {
      console.error("상태 변경 실패:", err);
      alert("체크 상태를 저장하지 못했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-600">
          My DB Todo List
        </h1>
        
        <div className="flex mb-6 shadow-sm">
          <input 
            type="text" 
            className="flex-grow border border-gray-300 p-3 rounded-l-lg outline-none focus:border-blue-500 transition-all"
            placeholder="할 일을 입력하세요..."
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return; 
              if (e.key === 'Enter') addTodo();
            }}
          />
          <button 
            onClick={addTodo}
            className="bg-blue-500 text-white px-5 py-3 rounded-r-lg font-bold hover:bg-blue-600 transition-colors"
          >
            추가
          </button>
        </div>

        <ul className="space-y-3">
          {todos.map(item => (
            <li 
              key={item._id} // 몽고DB의 ID인 _id 사용
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={item.completed}
                  // id뿐만 아니라 현재의 completed 상태도 같이 보내줍니다.
                  onChange={() => toggleTodo(item._id, item.completed)} 
                  className="w-5 h-5 cursor-pointer accent-blue-500"
                />
                <span className={`text-lg ${item.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {item.title}
                </span>
              </div>
              <button 
                onClick={() => deleteTodo(item._id)}
                className="text-red-400 hover:text-red-600 font-medium p-1"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && (
          <p className="text-center text-gray-400 mt-6">할 일을 모두 마쳤습니다! </p>
        )}
      </div>
    </div>
  )
}

export default App
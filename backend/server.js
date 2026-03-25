require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// [필독] 1순위: CORS 설정을 가장 먼저 선언해야 브라우저 차단이 풀립니다.
app.use(cors({
  origin: "*", // 모든 출처 허용 (개발 단계에서 가장 확실한 방법)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// 2순위: JSON 데이터 해석 설정
app.use(express.json());

// MongoDB 연결 및 에러 로깅 강화
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공!'))
  .catch(err => {
    console.error('MongoDB 연결 실패 원인:');
    console.error(err.message);
  });

// 데이터 구조 정의
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});
const Todo = mongoose.model('Todo', todoSchema);

// API 기능들
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  console.log("요청 도착:", req.body);
  try {
    const newTodo = new Todo({ title: req.body.title });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    console.error("저장 에러:", err.message);
    res.status(403).json({ error: err.message });
  }
});

// 할 일 상태 수정 (체크박스 토글용)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    // DB에서 id를 찾아 completed 상태를 업데이트합니다.
    const updatedTodo = await Todo.findByIdAndUpdate(
      id, 
      { completed }, 
      { new: true } // 업데이트된 후의 데이터를 res로 보내주기 위함
    );

    res.json(updatedTodo);
  } catch (err) {
    console.error("수정 에러:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 로컬(내 맥북)에서 개발할 때만 서버를 직접 켭니다.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`로컬 서버 실행 중: ${PORT}`));
}

// [핵심] Vercel이 가져가서 쓸 수 있게 내보냅니다.
module.exports = app;
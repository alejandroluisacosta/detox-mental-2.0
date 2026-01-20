import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ status: "ok", message: "Detox Mental backend is alive." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

app.use("/chat", chatRoutes);

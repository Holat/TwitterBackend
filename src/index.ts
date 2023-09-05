const express = require("express");
import userRoutes from "./routes/userRoutes";
import tweetRoutes from "./routes/tweetRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(express.json());
app.use("/user", userRoutes);
app.use("/tweet", tweetRoutes);
app.use("/auth", authRoutes);

// app.METHOD(PATH, HANDLER)
app.get("/", (req: string, res: any) => {
  res.send("Hello world");
});

app.listen(3000, () => {
  console.log("Server ready at localhost:3000");
});

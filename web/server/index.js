import app from "./app.js";

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`PipePal server listening on port ${PORT}`);
});

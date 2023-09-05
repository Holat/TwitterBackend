import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = "SUPER SECRET";

// Tweet CRUD
router.post("/", async (req, res) => {
  const { content, image } = req.body;

  // Authentication
  const authHeader = req.headers["authorization"];
  const jwtToken = authHeader?.split(" ")[1];
  if (!jwtToken) {
    return res.sendStatus(401);
  }

  // decode the jwt token
  try {
    const payload = jwt.verify(jwtToken, JWT_SECRET) as {
      tokenId: number;
    };
    const dbToken = await prisma.token.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });

    if (!dbToken?.valid || dbToken.expiration < new Date()) {
      return res.status(401).json({ error: "Session ended" });
    }

    console.log(dbToken.user);
  } catch (e) {
    return res.sendStatus(404);
  }
  // try {
  //   const result = await prisma.tweet.create({
  //     data: {
  //       content,
  //       image,
  //       userId, // Manage based on the auth user
  //     },
  //   });
  //   res.json(result);
  // } catch (e) {
  //   res.status(400).json({ error: "User name or email should be unique" });
  // }
});

router.get("/", async (req, res) => {
  const result = await prisma.tweet.findMany({
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
    },
  });
  res.json(result);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const tweet = await prisma.tweet.findUnique({
    where: { id: Number(id) },
    include: { user: true },
  });
  if (!tweet) {
    return res.status(404).json({ error: "Tweet not found" });
  }
  res.json(tweet);
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  // const {};
  res.status(501).json({ error: "Not implemented" + id });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.tweet.delete({ where: { id: Number(id) } });
  res.status(501).json({ error: "Not implemented" + id });
});

export default router;

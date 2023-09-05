import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATE_EXPIRATION_TOKEN = 12;
const JWT_SECRET = "SUPER SECRET";

const router = Router();
const prisma = new PrismaClient();

function generateEmailToken(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateAuthToken(tokenId: number): string {
  const jwtPayload = { tokenId };

  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: "HS256",
    noTimestamp: true,
  });
}

// Create a user if it doesn't exist
// generate the emailToken and send it to their email
router.post("/login", async (req, res) => {
  const { email } = req.body;

  const emailToken = generateEmailToken();
  const expiration = new Date(
    new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
  );

  try {
    const createToken = await prisma.token.create({
      data: {
        type: "EMAIL",
        emailToken,
        expiration,
        user: {
          connectOrCreate: {
            where: { email },
            create: { email },
          },
        },
      },
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "could not start auth process" });
  }

  // send  emailToken to user's email
  res.sendStatus(200);
});

// Validate the emailToken
//  Generate a long-live , jmt
router.post("/authenticate", async (req, res) => {
  const { email, emailToken } = req.body;
  const expiration = new Date(
    new Date().getTime() + AUTHENTICATE_EXPIRATION_TOKEN * 60 * 60 * 1000
  );
  const dbEmailToken = await prisma.token.findUnique({
    where: {
      emailToken,
    },
    include: { user: true },
  });
  if (!dbEmailToken || !dbEmailToken.valid) {
    return res.sendStatus(401);
  }

  if (dbEmailToken.expiration < new Date()) {
    return res.status(401).json({ error: "token expired" });
  }

  if (dbEmailToken?.user?.email !== email) {
    return res.status(401).json({ error: "Invalid Token" });
  }
  //  User has been Validated at this point

  // generate an API token
  const apiToken = await prisma.token.create({
    data: {
      type: "API",
      expiration,
      user: {
        connect: {
          email,
        },
      },
    },
  });

  // Invalidate the email token
  await prisma.token.update({
    where: { id: dbEmailToken.id },
    data: { valid: false },
  });

  // generate the JWT token
  const authToken = generateAuthToken(apiToken.id);

  res.json(authToken);
});

export default router;

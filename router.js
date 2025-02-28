import { Router } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Schedule, User } from "./modals.js";
import becrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import JWT_Auth_Middleware from "./jwt.middleware.js";

dotenv.config({
  path: ".env",
});

const router = Router();

router.get("/", (req, res) => {
  res.json({
    Message: "Server Started",
    Status: "Okay",
  });
});

router.post("/api/create/user", async (req, res) => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
      .then(async () => {
        console.log("Connected to database");

        const user = await User.findOne({
          username: req.body.username,
          email: req.body.email,
        });

        // Perform check if user exist in database or not.

        if (user) {
          return res.status(400).json({
            Message: "User already exist in database",
            Status: "Request rejected",
          });
        }

        await User.insertOne({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profileImageURI: req.body.profileImageURI || null,
        })
          .then(() => {
            jwt.sign(
              {
                username: req.body.username,
                email: req.body.email,
              },
              process.env.JWT_SECRET_CODE,
              { expiresIn: process.env.JWT_TOKEN_EXPIRY },
              (err, token) => {
                if (err) {
                  return res.status(500).json({
                    Message: "Internal server error for JWT",
                    Status: "Failed",
                  });
                }
                res.status(200).json({
                  Message: "User successfully created in database",
                  JWT_Token: token,
                  Status: "Okay",
                });
              }
            );
          })
          .catch((e) => {
            res.status(400).json({
              Message: "Unsuccessfull",
              Error: "This email already exist in database",
            });
            console.log(e);
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      Message: "Internal server error",
      Status: "Failed",
    });
  } finally {
    await mongoose
      .disconnect()
      .then(() => {
        console.log("Disconnected from database successfully");
      })
      .catch((err) => {
        console.log("Error", err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  }
});

// [token , password] from req.body is required.
router.delete("/api/delete/user", JWT_Auth_Middleware, async (req, res) => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
      .then(async () => {
        console.log("Connected to database");

        const user = await User.findOne({
          username: req.auth.username,
          email: req.auth.email,
        });

        // Perform check if user exist in database or not.

        if (!user) {
          return res.status(404).json({
            Message: "User not exist in database",
            Status: "Not found",
          });
        }

        if (!(await becrypt.compare(req.body.password, user.password))) {
          return res.status(400).json({
            Message: "Unsuccessfull",
            Error: "Password mismatch",
          });
        }

        await User.deleteOne({
          username: req.auth.username,
          email: req.auth.email,
        })
          .then(() => {
            res.json({
              Message: "User successfully deleted from database",
              Status: "Okay",
            });
          })
          .catch((e) => {
            res.json({
              Message: "Unsuccessfull",
              Error: "User not deleted",
            });
            console.log(e);
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      Message: "Internal server error",
      Status: "Failed",
    });
  } finally {
    await mongoose
      .disconnect()
      .then(() => {
        console.log("Disconnected from database successfully");
      })
      .catch((err) => {
        console.log("Error", err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  }
});

// [username , email , password] from req.body is required.
router.post("/api/verify/user", async (req, res) => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
      .then(async () => {
        console.log("Connected to database");

        const user = await User.findOne({
          username: req.body.username,
          email: req.body.email,
        });

        // Perform check if user exist in database or not.

        if (!user) {
          return res.status(404).json({
            Message: "User not exist in database",
            Status: "Verify failed",
          });
        }

        if (!(await becrypt.compare(req.body.password, user.password))) {
          return res.status(400).json({
            Message: "Unsuccessfull",
            Error: "Verify failed",
          });
        }

        jwt.sign(
          {
            username: req.body.username,
            email: req.body.email,
          },
          process.env.JWT_SECRET_CODE,
          { expiresIn: process.env.JWT_TOKEN_EXPIRY },
          (err, token) => {
            if (err) {
              return res.status(500).json({
                Message: "Internal server error for JWT",
                Status: "Failed",
              });
            }
            res.status(200).json({
              Message: "User successfully verified",
              JWT_Token: token,
              Status: "Okay",
            });
          }
        );
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      Message: "Internal server error",
      Status: "Failed",
    });
  } finally {
    await mongoose
      .disconnect()
      .then(() => {
        console.log("Disconnected from database successfully");
      })
      .catch((err) => {
        console.log("Error", err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  }
});

router.post("/api/create/schedule", JWT_Auth_Middleware, async (req, res) => {
  const {
    period,
    section,
    semester,
    branch,
    subject,
    day,
    from_time,
    to_time,
  } = req.body;

  try {
    await mongoose
      .connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
      .then(async () => {
        const user = await User.findOne({
          username: req.auth.username,
          email: req.auth.email,
        });

        if (!user) {
          res.status(404).json({
            Message: "User not found",
            Status: "Failed",
          });
        }

        await Schedule.insertOne({
          period: period,
          section: section,
          semester: semester,
          branch: branch,
          subject: subject,
          day: day,
          from_time: from_time,
          to_time: to_time,
          user_id: user._id,
        })
          .then(() => {
            res.status(200).json({
              Message: "Schedule successfully created",
              Status: "Okay",
            });
          })
          .catch((e) => {
            console.log(e);
            res.status(400).json({
              Message: "Schedule not created",
              Status: "Failed",
            });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      Message: "Internal server error",
      Status: "Failed",
    });
  } finally {
    await mongoose
      .disconnect()
      .then(() => {
        console.log("Disconnected from database successfully");
      })
      .catch((err) => {
        console.log("Error", err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  }
});

router.patch("/api/update/schedule", JWT_Auth_Middleware, async (req, res) => {
  const {
    new_period,
    new_section,
    new_semester,
    new_branch,
    new_subject,
    new_day,
    new_from_time,
    new_to_time,
    object_id,
  } = req.body;

  try {
    await mongoose
      .connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
      .then(async () => {
        if (new_period) {
          await Schedule.updateOne(
            {
              _id: object_id,
            },
            {
              $set: { period: new_period },
            }
          )
            .then(() => {
              res.status(200).json({
                Message: "Schedule period successfully updated",
                Status: "Okay",
              });
            })
            .catch((e) => {
              console.log(e);
              res.status(400).json({
                Message: "Schedule period not updated",
                Status: "Failed",
              });
            });
        }

        if (new_section) {
          await Schedule.updateOne(
            {
              _id: object_id,
            },
            {
              $set: { section: new_section },
            }
          )
            .then(() => {
              res.status(200).json({
                Message: "Schedule section successfully updated",
                Status: "Okay",
              });
            })
            .catch((e) => {
              console.log(e);
              res.status(400).json({
                Message: "Schedule section not updated",
                Status: "Failed",
              });
            });
        }

        if (new_semester) {
          await Schedule.updateOne(
            {
              _id: object_id,
            },
            {
              $set: { semester: new_semester },
            }
          )
            .then(() => {
              res.status(200).json({
                Message: "Schedule semester successfully updated",
                Status: "Okay",
              });
            })
            .catch((e) => {
              console.log(e);
              res.status(400).json({
                Message: "Schedule semester not updated",
                Status: "Failed",
              });
            });
        }

        if (new_branch) {
          await Schedule.updateOne(
            {
              _id: object_id,
            },
            {
              $set: { branch: new_branch },
            }
          )
            .then(() => {
              res.status(200).json({
                Message: "Schedule branch successfully updated",
                Status: "Okay",
              });
            })
            .catch((e) => {
              console.log(e);
              res.status(400).json({
                Message: "Schedule branch not updated",
                Status: "Failed",
              });
            });
        }

        if (new_subject) {
          await Schedule.updateOne(
            {
              _id: object_id,
            },
            {
              $set: { subject: new_subject },
            }
          )
            .then(() => {
              res.status(200).json({
                Message: "Schedule subject successfully updated",
                Status: "Okay",
              });
            })
            .catch((e) => {
              console.log(e);
              res.status(400).json({
                Message: "Schedule subject not updated",
                Status: "Failed",
              });
            });
        }

        if (new_day) {
          await Schedule.updateOne(
            {
              _id: object_id,
            },
            {
              $set: { day: new_day },
            }
          )
            .then(() => {
              res.status(200).json({
                Message: "Schedule day successfully updated",
                Status: "Okay",
              });
            })
            .catch((e) => {
              console.log(e);
              res.status(400).json({
                Message: "Schedule day not updated",
                Status: "Failed",
              });
            });
        }

        if (new_from_time) {
          await Schedule.updateOne(
            {
              _id: object_id,
            },
            {
              $set: { from_time: new_from_time },
            }
          )
            .then(() => {
              res.status(200).json({
                Message: "Schedule from_time successfully updated",
                Status: "Okay",
              });
            })
            .catch((e) => {
              console.log(e);
              res.status(400).json({
                Message: "Schedule from_time not updated",
                Status: "Failed",
              });
            });
        }

        if (new_to_time) {
          await Schedule.updateOne(
            {
              _id: object_id,
            },
            {
              $set: { to_time: new_to_time },
            }
          )
            .then(() => {
              res.status(200).json({
                Message: "Schedule to_time successfully updated",
                Status: "Okay",
              });
            })
            .catch((e) => {
              console.log(e);
              res.status(400).json({
                Message: "Schedule to_time not updated",
                Status: "Failed",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      Message: "Internal server error",
      Status: "Failed",
    });
  } finally {
    await mongoose
      .disconnect()
      .then(() => {
        console.log("Disconnected from database successfully");
      })
      .catch((err) => {
        console.log("Error", err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  }
});

// token required only
router.delete("/api/delete/schedule", JWT_Auth_Middleware, async (req, res) => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
      .then(async () => {
        const user = await User.findOne({
          username: req.auth.username,
          email: req.auth.email,
        });

        if (!user) {
          res.status(404).json({
            Message: "User not found",
            Status: "Failed",
          });
        }

        await Schedule.deleteMany({
          user_id: user._id,
        })
          .then(() => {
            res.status(200).json({
              Message: "All schedule successfully deleted",
              Status: "Okay",
            });
          })
          .catch((e) => {
            console.log(e);
            res.status(400).json({
              Message: "Schedule not deleted",
              Status: "Failed",
            });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      Message: "Internal server error",
      Status: "Failed",
    });
  } finally {
    await mongoose
      .disconnect()
      .then(() => {
        console.log("Disconnected from database successfully");
      })
      .catch((err) => {
        console.log("Error", err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  }
});

// [token , day] required.
router.get("/api/get/schedule", JWT_Auth_Middleware, async (req, res) => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
      .then(async () => {
        const user = await User.findOne({
          username: req.auth.username,
          email: req.auth.email,
        });

        if (!user) {
          res.status(404).json({
            Message: "User not found",
            Status: "Failed",
          });
        }

        await Schedule.find({
          user_id: user._id,
          day: req.body.day,
        })
          .then((item) => {
            res.status(item.length == 0 ? 404 : 200).json({
              Message: "Schedule successfully fetched",
              Data: item.length == 0 ? "Empty" : item,
              Status: "Okay",
            });
          })
          .catch((e) => {
            console.log(e);
            res.status(400).json({
              Message: "Schedule not deleted",
              Status: "Failed",
            });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      Message: "Internal server error",
      Status: "Failed",
    });
  } finally {
    await mongoose
      .disconnect()
      .then(() => {
        console.log("Disconnected from database successfully");
      })
      .catch((err) => {
        console.log("Error", err);
        res.status(500).json({
          Message: "Internal server error for mongodb",
          Status: "Failed",
        });
      });
  }
});

export default router;

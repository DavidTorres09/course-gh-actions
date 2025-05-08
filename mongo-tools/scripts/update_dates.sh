#!/bin/bash

# For now, we can't use inputs, for security
MONGO_URI="mongodb://lotto:lotto@localhost:27018/Lotto?authMechanism=SCRAM-SHA-1"

mongosh "$MONGO_URI" --eval '
db.getCollection("Tickets").updateMany(
  {},
  [
    {
      $set: {
        dates: {
          $concatArrays: [
            [
              {
                $dateFromParts: {
                  year: { $year: "$$NOW" },
                  month: { $month: "$$NOW" },
                  day: { $dayOfMonth: "$$NOW" },
                  hour: { $hour: { $arrayElemAt: ["$dates", 0] } },
                  minute: { $minute: { $arrayElemAt: ["$dates", 0] } },
                  second: { $second: { $arrayElemAt: ["$dates", 0] } },
                  millisecond: { $millisecond: { $arrayElemAt: ["$dates", 0] } }
                }
              }
            ],
            { $slice: ["$dates", 1, { $size: "$dates" }] }
          ]
        }
      }
    }
  ]
);
'

mongosh "$MONGO_URI" --eval '
db.getCollection("Subtickets").updateMany(
  {},
  [
    {
      $set: {
        drawDate: {
          $dateFromParts: {
            year: { $year: "$$NOW" },
            month: { $month: "$$NOW" },
            day: { $dayOfMonth: "$$NOW" },
            hour: { $hour: "$drawDate" },
            minute: { $minute: "$drawDate" },
            second: { $second: "$drawDate" },
            millisecond: { $millisecond: "$drawDate" }
          }
        }
      }
    }
  ]
);
'

mongosh "$MONGO_URI" --eval '
db.getCollection("GradingResults").updateMany(
  {},
  [
    {
      $set: {
        drawDate: {
          $dateFromParts: {
            year: { $year: "$$NOW" },
            month: { $month: "$$NOW" },
            day: { $dayOfMonth: "$$NOW" },
            hour: { $hour: "$drawDate" },
            minute: { $minute: "$drawDate" },
            second: { $second: "$drawDate" },
            millisecond: { $millisecond: "$drawDate" }
          }
        }
      }
    }
  ]
);
'


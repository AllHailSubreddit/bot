const gocards = require("./index");
const nock = require("nock");
const path = require("path");

const mockServer = nock("https://gocards.com");

function getFixturePath(filename) {
  return path.resolve(__dirname, "__fixtures__", filename);
}

afterAll(() => {
  nock.restore();
});

afterEach(() => {
  nock.cleanAll();
});

describe("getCalendarForAllSports", () => {
  it("returns game objects for multiple sports", async () => {
    // success is measured by the fact that the correct URL was requested
    mockServer
      .get("/calendar.ashx/calendar.rss?sport_id=0")
      .replyWithFile(200, getFixturePath("calendar-0.rss"), {
        "Content-Type": "application/rss+xml",
      });
    const response = await gocards.getCalendarForAllSports();

    const expected = 14;
    const actual = response.items.length;

    expect(actual).toBe(expected);
  });
});

describe("getCalendarForSport", () => {
  it("returns game objects for the specified sport", async () => {
    // success is measured by the fact that the correct URL was requested
    mockServer
      .get("/calendar.ashx/calendar.rss?sport_id=3")
      .replyWithFile(200, getFixturePath("calendar-3.rss"), {
        "Content-Type": "application/rss+xml",
      });
    const response = await gocards.getCalendarForSport(3);

    const expected = 12;
    const actual = response.items.length;

    expect(actual).toBe(expected);
  });
});

// it("returns points-scored game object", async () => {});
//
// it("returns wins-scored game object", async () => {});
//
// it("returns places-scored game object", async () => {});

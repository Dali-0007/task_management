// End-to-end API tests. They start the real server against a separate test
// database and wipe that database first, so they refuse to run unless
// TEST_DB_NAME ends with "_test". Run `npm run migrate` against it first:
//   DB_NAME=adn_task_manager_test npm run migrate
//   npm test
require("dotenv").config({ quiet: true });

const { test, before, after, describe } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const { Pool } = require("pg");

const TEST_DB_NAME = process.env.TEST_DB_NAME || "adn_task_manager_test";
const PORT = process.env.TEST_PORT || "5055";
const BASE_URL = `http://localhost:${PORT}/api`;

if (!TEST_DB_NAME.endsWith("_test")) {
  throw new Error("TEST_DB_NAME must end with _test; refusing to wipe it.");
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: TEST_DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

let server;

// Minimal cookie-aware client, one per signed-in user.
function createClient() {
  let cookie = "";

  return async function request(method, url, body) {
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];

    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
  };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) return;
    } catch {
      // Server not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Test server did not start.");
}

async function signUpAndIn(name, email) {
  const client = createClient();
  const password = "password123";

  const signUp = await client("POST", "/auth/sign-up", { name, email, password });
  assert.equal(signUp.status, 201);

  const signIn = await client("POST", "/auth/sign-in", { email, password });
  assert.equal(signIn.status, 200);

  return { client, user: signIn.data.user };
}

const users = {};
let projectId;
let archivedProjectId;
let otherProjectId;

before(async () => {
  await pool.query(
    `TRUNCATE activity_log, task_comments, tasks, project_members,
              projects, users RESTART IDENTITY CASCADE`
  );

  server = spawn(process.execPath, [path.join(__dirname, "../src/server.js")], {
    env: { ...process.env, DB_NAME: TEST_DB_NAME, PORT },
    stdio: "ignore",
  });

  await waitForServer();

  users.manager = await signUpAndIn("Pat Manager", "pm@test.local");
  users.member = await signUpAndIn("Tara Member", "tm@test.local");
  users.peer = await signUpAndIn("Pia Peer", "peer@test.local");
  users.outsider = await signUpAndIn("Oli Outsider", "out@test.local");

  // Roles are not self-service; promote the manager directly in the test DB.
  await pool.query("UPDATE users SET role = 'PROJECT_MANAGER' WHERE id = $1", [
    users.manager.user.id,
  ]);
  users.manager.user.role = "PROJECT_MANAGER";

  const pm = users.manager.client;

  const project = await pm("POST", "/projects", { name: "Apollo", description: "" });
  assert.equal(project.status, 201);
  projectId = project.data.project.id;

  for (const key of ["member", "peer"]) {
    const added = await pm("POST", `/project-membership/${projectId}/members`, {
      userId: users[key].user.id,
    });
    assert.equal(added.status, 201);
  }

  const archived = await pm("POST", "/projects", { name: "Old project" });
  archivedProjectId = archived.data.project.id;

  const other = await pm("POST", "/projects", { name: "Private" });
  otherProjectId = other.data.project.id;
});

after(async () => {
  server?.kill();
  await pool.end();
});

describe("health and auth", () => {
  test("health and database health respond", async () => {
    const client = createClient();
    assert.equal((await client("GET", "/health")).status, 200);
    assert.equal((await client("GET", "/db-health")).status, 200);
  });

  test("new users default to TEAM_MEMBER", () => {
    assert.equal(users.member.user.role, "TEAM_MEMBER");
  });

  test("session is restored from the cookie", async () => {
    const me = await users.member.client("GET", "/auth/me");
    assert.equal(me.status, 200);
    assert.equal(me.data.user.email, "tm@test.local");
    assert.equal(me.data.user.password_hash, undefined);
  });

  test("protected routes reject anonymous requests", async () => {
    const anonymous = createClient();
    assert.equal((await anonymous("GET", "/tasks")).status, 401);
    assert.equal((await anonymous("GET", "/auth/me")).status, 401);
  });
});

describe("profile", () => {
  test("users can change their name but not their role", async () => {
    const response = await users.member.client("PATCH", "/auth/me", {
      name: "  Tara M.  ",
      role: "PROJECT_MANAGER",
    });
    assert.equal(response.status, 200);
    assert.equal(response.data.user.name, "Tara M.");
    assert.equal(response.data.user.role, "TEAM_MEMBER");
  });

  test("blank names are rejected", async () => {
    const response = await users.member.client("PATCH", "/auth/me", { name: " " });
    assert.equal(response.status, 400);
  });
});

describe("tasks", () => {
  let taskId;

  test("manager creates a task assigned to a project member", async () => {
    const response = await users.manager.client("POST", "/tasks", {
      projectId,
      title: "Design login",
      description: "Mockups first",
      priority: "HIGH",
      dueDate: "2030-01-15",
      assigneeId: users.member.user.id,
    });

    assert.equal(response.status, 201);
    const { task } = response.data;
    taskId = task.id;
    assert.equal(task.status, "TODO");
    assert.equal(task.priority, "HIGH");
    assert.equal(task.due_date, "2030-01-15");
    assert.equal(task.assignee_name, "Tara M.");
    assert.equal(task.project_name, "Apollo");
    assert.equal(task.permissions.canEdit, true);
  });

  test("optional fields fall back to defaults", async () => {
    const response = await users.manager.client("POST", "/tasks", {
      projectId,
      title: "Write docs",
    });
    assert.equal(response.status, 201);
    assert.equal(response.data.task.priority, "MEDIUM");
    assert.equal(response.data.task.assignee_id, null);
    assert.equal(response.data.task.due_date, null);
  });

  test("validation errors return 400", async () => {
    const pm = users.manager.client;
    const cases = [
      { projectId, title: "" },
      { projectId, title: "x", status: "DONE" },
      { projectId, title: "x", priority: "CRITICAL" },
      { projectId, title: "x", dueDate: "2030-02-30" },
      { projectId: "abc", title: "x" },
      { projectId, title: "x".repeat(201) },
    ];

    for (const body of cases) {
      assert.equal((await pm("POST", "/tasks", body)).status, 400, JSON.stringify(body));
    }
  });

  test("assignees must be project members", async () => {
    const response = await users.manager.client("POST", "/tasks", {
      projectId,
      title: "Bad assignment",
      assigneeId: users.outsider.user.id,
    });
    assert.equal(response.status, 400);
  });

  test("team members cannot create tasks", async () => {
    const response = await users.member.client("POST", "/tasks", {
      projectId,
      title: "Sneaky",
    });
    assert.equal(response.status, 403);
  });

  test("managers cannot create tasks in projects they don't belong to", async () => {
    const response = await users.manager.client("POST", "/tasks", {
      projectId: 999999,
      title: "Nowhere",
    });
    assert.equal(response.status, 404);
  });

  test("members list project tasks; outsiders get 404", async () => {
    const member = await users.peer.client("GET", `/tasks?projectId=${projectId}`);
    assert.equal(member.status, 200);
    assert.equal(member.data.total, 2);

    const outsider = await users.outsider.client("GET", `/tasks?projectId=${projectId}`);
    assert.equal(outsider.status, 404);

    const outsiderAll = await users.outsider.client("GET", "/tasks");
    assert.equal(outsiderAll.data.total, 0);
  });

  test("assignee=me, filters, search and sort", async () => {
    const mine = await users.member.client("GET", "/tasks?assignee=me");
    assert.deepEqual(mine.data.tasks.map((task) => task.title), ["Design login"]);

    const pm = users.manager.client;
    const high = await pm("GET", `/tasks?projectId=${projectId}&priority=HIGH`);
    assert.equal(high.data.total, 1);

    const search = await pm("GET", "/tasks?search=mockups");
    assert.equal(search.data.tasks[0].title, "Design login");

    const sorted = await pm("GET", "/tasks?sort=title&order=asc");
    assert.deepEqual(sorted.data.tasks.map((task) => task.title), ["Design login", "Write docs"]);

    assert.equal((await pm("GET", "/tasks?sort=password_hash")).status, 400);
  });

  test("task details are hidden from non-members", async () => {
    assert.equal((await users.peer.client("GET", `/tasks/${taskId}`)).status, 200);
    assert.equal((await users.outsider.client("GET", `/tasks/${taskId}`)).status, 404);
    assert.equal((await users.peer.client("GET", "/tasks/abc")).status, 400);
  });

  test("assignee may update status only", async () => {
    const tm = users.member.client;

    const ok = await tm("PATCH", `/tasks/${taskId}`, { status: "IN_PROGRESS" });
    assert.equal(ok.status, 200);
    assert.equal(ok.data.task.status, "IN_PROGRESS");

    const sneaky = await tm("PATCH", `/tasks/${taskId}`, {
      status: "COMPLETED",
      priority: "LOW",
    });
    assert.equal(sneaky.status, 403);

    for (const body of [
      { title: "Renamed" },
      { description: "changed" },
      { dueDate: "2031-01-01" },
      { assigneeId: users.peer.user.id },
    ]) {
      assert.equal((await tm("PATCH", `/tasks/${taskId}`, body)).status, 403);
    }

    const stored = await pool.query("SELECT status, priority FROM tasks WHERE id = $1", [taskId]);
    assert.deepEqual(stored.rows[0], { status: "IN_PROGRESS", priority: "HIGH" });
  });

  test("other team members cannot change a task that isn't theirs", async () => {
    const response = await users.peer.client("PATCH", `/tasks/${taskId}`, {
      status: "COMPLETED",
    });
    assert.equal(response.status, 403);
  });

  test("unknown update fields are rejected", async () => {
    const response = await users.manager.client("PATCH", `/tasks/${taskId}`, {
      project_id: otherProjectId,
    });
    assert.equal(response.status, 400);
  });

  test("manager edits details and reassigns", async () => {
    const response = await users.manager.client("PATCH", `/tasks/${taskId}`, {
      title: "Design login page",
      priority: "URGENT",
      dueDate: null,
      assigneeId: users.peer.user.id,
    });
    assert.equal(response.status, 200);
    const { task } = response.data;
    assert.equal(task.title, "Design login page");
    assert.equal(task.priority, "URGENT");
    assert.equal(task.due_date, null);
    assert.equal(task.assignee_name, "Pia Peer");

    const formerAssignee = await users.member.client("PATCH", `/tasks/${taskId}`, {
      status: "COMPLETED",
    });
    assert.equal(formerAssignee.status, 403);
  });

  test("removing a member unassigns their tasks", async () => {
    const created = await users.manager.client("POST", "/tasks", {
      projectId,
      title: "Temp task",
      assigneeId: users.member.user.id,
    });
    const tempId = created.data.task.id;

    const removed = await users.manager.client(
      "DELETE",
      `/project-membership/${projectId}/members/${users.member.user.id}`
    );
    assert.equal(removed.status, 200);

    const stored = await pool.query("SELECT assignee_id FROM tasks WHERE id = $1", [tempId]);
    assert.equal(stored.rows[0].assignee_id, null);

    await users.manager.client("POST", `/project-membership/${projectId}/members`, {
      userId: users.member.user.id,
    });
    await users.manager.client("DELETE", `/tasks/${tempId}`);
  });
});

describe("comments", () => {
  let taskId;

  before(async () => {
    const created = await users.manager.client("POST", "/tasks", {
      projectId,
      title: "Discuss API",
    });
    taskId = created.data.task.id;
  });

  test("members comment and see comments in order", async () => {
    const tm = users.member.client;
    assert.equal((await tm("POST", `/tasks/${taskId}/comments`, { content: "First" })).status, 201);

    const second = await users.manager.client("POST", `/tasks/${taskId}/comments`, {
      content: "Second",
    });
    assert.equal(second.data.comment.author_name, "Pat Manager");

    const list = await tm("GET", `/tasks/${taskId}/comments`);
    assert.deepEqual(list.data.comments.map((comment) => comment.content), ["First", "Second"]);
    assert.equal(list.data.comments[0].author_name, "Tara M.");
  });

  test("empty comments and outsiders are rejected", async () => {
    const empty = await users.member.client("POST", `/tasks/${taskId}/comments`, { content: "  " });
    assert.equal(empty.status, 400);

    const outsiderList = await users.outsider.client("GET", `/tasks/${taskId}/comments`);
    assert.equal(outsiderList.status, 404);

    const outsiderPost = await users.outsider.client("POST", `/tasks/${taskId}/comments`, {
      content: "hi",
    });
    assert.equal(outsiderPost.status, 404);
  });

  test("deleting a task removes its comments", async () => {
    assert.equal((await users.member.client("DELETE", `/tasks/${taskId}`)).status, 403);
    assert.equal((await users.outsider.client("DELETE", `/tasks/${taskId}`)).status, 404);

    assert.equal((await users.manager.client("DELETE", `/tasks/${taskId}`)).status, 200);
    assert.equal((await users.manager.client("GET", `/tasks/${taskId}`)).status, 404);

    const comments = await pool.query("SELECT COUNT(*)::int AS n FROM task_comments WHERE task_id = $1", [taskId]);
    assert.equal(comments.rows[0].n, 0);
  });
});

describe("archived projects are read-only", () => {
  test("no task writes in archived projects", async () => {
    const pm = users.manager.client;
    const created = await pm("POST", "/tasks", { projectId: archivedProjectId, title: "Before archive" });
    const id = created.data.task.id;

    assert.equal((await pm("PATCH", `/projects/${archivedProjectId}/archive`)).status, 200);

    assert.equal((await pm("POST", "/tasks", { projectId: archivedProjectId, title: "x" })).status, 409);
    assert.equal((await pm("PATCH", `/tasks/${id}`, { status: "COMPLETED" })).status, 409);
    assert.equal((await pm("POST", `/tasks/${id}/comments`, { content: "x" })).status, 409);
    assert.equal((await pm("DELETE", `/tasks/${id}`)).status, 409);

    const task = await pm("GET", `/tasks/${id}`);
    assert.equal(task.data.task.permissions.canEdit, false);
  });
});

describe("dashboard summary", () => {
  test("counts come from the database and are scoped to the user", async () => {
    const pm = await users.manager.client("GET", "/tasks/summary");
    assert.equal(pm.status, 200);
    const { summary } = pm.data;

    const actual = await pool.query(
      `SELECT COUNT(*)::int AS n FROM tasks t
       JOIN project_members m ON m.project_id = t.project_id AND m.user_id = $1`,
      [users.manager.user.id]
    );
    assert.equal(summary.tasks.total, actual.rows[0].n);
    assert.ok(summary.recentActivity.length > 0);
    assert.ok(summary.projectProgress.some((project) => project.name === "Apollo"));

    const outsider = await users.outsider.client("GET", "/tasks/summary");
    assert.equal(outsider.data.summary.tasks.total, 0);
    assert.equal(outsider.data.summary.recentActivity.length, 0);
  });
});

describe("sign out", () => {
  test("clears the session", async () => {
    const client = users.peer.client;
    assert.equal((await client("POST", "/auth/sign-out")).status, 200);
    assert.equal((await client("GET", "/auth/me")).status, 401);
  });
});

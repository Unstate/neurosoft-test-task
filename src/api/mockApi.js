import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const DELAY_MS = 600;

const mock = new MockAdapter(axios, { delayResponse: DELAY_MS });

const seedData = {
  courses: [
    { id: 1, title: "Vue 3 с нуля" },
    { id: 2, title: "JavaScript: продвинутый уровень" },
    { id: 3, title: "TypeScript для фронтендера" },
    { id: 4, title: "Основы UX-дизайна" },
    { id: 5, title: "Node.js: backend для фронтендеров" },
    { id: 6, title: "React с хуками" },
    { id: 7, title: "Python для начинающих" },
  ],
  users: [
    { firstName: "Иван", lastName: "Петров", email: "ivan.petrov@example.com" },
    {
      firstName: "Мария",
      lastName: "Сидорова",
      email: "maria.sidorova@example.com",
    },
    {
      firstName: "Алексей",
      lastName: "Кузнецов",
      email: "alexey.kuznetsov@example.com",
    },
    {
      firstName: "Ольга",
      lastName: "Смирнова",
      email: "olga.smirnova@example.com",
    },
    {
      firstName: "Дмитрий",
      lastName: "Волков",
      email: "dmitry.volkov@example.com",
    },
    {
      firstName: "Екатерина",
      lastName: "Новикова",
      email: "ekaterina.novikova@example.com",
    },
    {
      firstName: "Анна",
      lastName: "Морозова",
      email: "anna.morozova@example.com",
    },
    {
      firstName: "Сергей",
      lastName: "Козлов",
      email: "sergey.kozlov@example.com",
    },
    {
      firstName: "Наталья",
      lastName: "Лебедева",
      email: "natalya.lebedeva@example.com",
    },
    {
      firstName: "Максим",
      lastName: "Соколов",
      email: "maxim.sokolov@example.com",
    },
  ],
  statuses: ["active", "completed", "cancelled"],
};

const generateRegistrations = () => {
  const registrations = [];
  let id = 1;

  seedData.courses.forEach((course) => {
    const count = Math.min(
      Math.floor(Math.random() * 4) + 5,
      seedData.users.length
    );

    const shuffledUsers = [...seedData.users].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const user = shuffledUsers[i];
      const statusIndex = Math.floor(Math.random() * seedData.statuses.length);

      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
      date.setDate(Math.floor(Math.random() * 28) + 1);
      date.setHours(Math.floor(Math.random() * 12) + 8);
      date.setMinutes(Math.floor(Math.random() * 60));

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const registeredAt = `${day}.${month}.${year} ${hours}:${minutes}`;

      registrations.push({
        id: id++,
        status: seedData.statuses[statusIndex],
        registeredAt,
        user: { ...user },
        course: { ...course },
      });
    }
  });

  return registrations;
};

let registrations = generateRegistrations();

mock.onGet(/\/api\/registrations(\?.*)?$/).reply((config) => {
  const url = new URL(config.url, "http://localhost");
  const courseId = url.searchParams.get("courseId");

  let filteredRegistrations = registrations;
  if (courseId) {
    filteredRegistrations = registrations.filter(
      (reg) => reg.course.id === parseInt(courseId, 10)
    );
  }

  return [200, { success: true, data: filteredRegistrations }];
});

mock.onPost("/api/registrations/cancel").reply((config) => {
  const { id, reason } = JSON.parse(config.data);
  const item = registrations.find((r) => r.id === id);

  if (!item) {
    return [404, { success: false, message: "Registration not found" }];
  }

  item.status = "cancelled";
  if (reason) {
    item.cancelReason = reason;
  }
  return [200, { success: true, data: item }];
});

// mock.onGet(/\/api\/registrations(\?.*)?$/).reply(500, { success: false, message: 'Internal server error' })

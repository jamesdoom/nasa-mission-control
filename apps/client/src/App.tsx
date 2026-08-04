import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "apod",
        lazy: async () => ({
          Component: (await import("./pages/ApodPage")).ApodPage,
        }),
      },
      {
        path: "asteroids",
        lazy: async () => ({
          Component: (await import("./pages/AsteroidsPage")).AsteroidsPage,
        }),
      },
      {
        path: "asteroids/:asteroidId",
        lazy: async () => ({
          Component: (await import("./pages/AsteroidDetailPage"))
            .AsteroidDetailPage,
        }),
      },
      {
        path: "media",
        lazy: async () => ({
          Component: (await import("./pages/MediaLibraryPage"))
            .MediaLibraryPage,
        }),
      },
      {
        path: "media/:nasaId",
        lazy: async () => ({
          Component: (await import("./pages/MediaDetailPage")).MediaDetailPage,
        }),
      },
      {
        path: "space-weather",
        lazy: async () => ({
          Component: (await import("./pages/SpaceWeatherPage"))
            .SpaceWeatherPage,
        }),
      },
      {
        path: "earth",
        lazy: async () => ({
          Component: (await import("./pages/EarthPage")).EarthPage,
        }),
      },
      {
        path: "missions",
        lazy: async () => ({
          Component: (await import("./pages/MissionsPage")).MissionsPage,
        }),
      },
      {
        path: "missions/:missionSlug",
        lazy: async () => ({
          Component: (await import("./pages/MissionDetailPage"))
            .MissionDetailPage,
        }),
      },
      {
        path: "trivia",
        lazy: async () => ({
          Component: (await import("./pages/TriviaPage")).TriviaPage,
        }),
      },
      {
        path: "favorites",
        lazy: async () => ({
          Component: (await import("./pages/FavoritesPage")).FavoritesPage,
        }),
      },
      {
        path: "about",
        lazy: async () => ({
          Component: (await import("./pages/AboutPage")).AboutPage,
        }),
      },
      {
        path: "*",
        lazy: async () => ({
          Component: (await import("./pages/NotFoundPage")).NotFoundPage,
        }),
      },
    ],
  },
]);
export function App() {
  return <RouterProvider router={router} />;
}

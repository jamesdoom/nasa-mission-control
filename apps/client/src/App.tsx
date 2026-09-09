import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { RouteErrorPage } from "./components/RouteErrorPage";
import { DashboardPage } from "./pages/DashboardPage";
import { loadLazyRoute } from "./utils/lazyRoute";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "search",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/SearchPage")))
            .SearchPage,
        }),
      },
      {
        path: "investigate",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/InvestigationPage"))
          ).InvestigationPage,
        }),
      },
      {
        path: "apod",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/ApodPage")))
            .ApodPage,
        }),
      },
      {
        path: "asteroids",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/AsteroidsPage"))
          ).AsteroidsPage,
        }),
      },
      {
        path: "asteroids/:asteroidId",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/AsteroidDetailPage"))
          ).AsteroidDetailPage,
        }),
      },
      {
        path: "media",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/MediaLibraryPage"))
          ).MediaLibraryPage,
        }),
      },
      {
        path: "media/:nasaId",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/MediaDetailPage"))
          ).MediaDetailPage,
        }),
      },
      {
        path: "space-weather",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/SpaceWeatherPage"))
          ).SpaceWeatherPage,
        }),
      },
      {
        path: "earth",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/EarthPage")))
            .EarthPage,
        }),
      },
      {
        path: "missions",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/MissionsPage")))
            .MissionsPage,
        }),
      },
      {
        path: "missions/compare",
        loader: () => redirect("/missions"),
      },
      {
        path: "missions/map",
        loader: () => redirect("/missions"),
      },
      {
        path: "missions/:missionSlug",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/MissionDetailPage"))
          ).MissionDetailPage,
        }),
      },
      {
        path: "scale-lab",
        loader: () => redirect("/missions"),
      },
      {
        path: "trivia",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/TriviaPage")))
            .TriviaPage,
        }),
      },
      {
        path: "learn",
        loader: () => redirect("/missions"),
      },
      {
        path: "discover",
        loader: () => redirect("/missions"),
      },
      {
        path: "stories/:storyId",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/StoryCollectionPage"))
          ).StoryCollectionPage,
        }),
      },
      {
        path: "favorites",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/FavoritesPage"))
          ).FavoritesPage,
        }),
      },
      {
        path: "about",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/AboutPage")))
            .AboutPage,
        }),
      },
      {
        path: "*",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/NotFoundPage")))
            .NotFoundPage,
        }),
      },
    ],
  },
]);
export function App() {
  return <RouterProvider router={router} />;
}

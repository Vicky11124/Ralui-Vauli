export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Something went wrong</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #fbf9f3; color: #2c2e25; font-family: system-ui, sans-serif; text-align: center; padding: 1rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { margin: 0 0 1.25rem; color: #6b6e60; font-size: 0.9rem; }
      a { display: inline-block; padding: 0.6rem 1rem; background: #5d6b45; color: #fbf9f3; text-decoration: none; font-size: 0.85rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. Please try again in a moment.</p>
      <a href="/">Go home</a>
    </main>
  </body>
</html>`;
}

# Munki My Admin

Munki My Admin is a small web console for building and publishing a Munki repository without editing plist files by hand. It manages people, groups, packages and assignments, then exports a static Munki repo that clients can consume directly.

<p align="center">
  <img src="docs/screen1.png" alt="Munki My Admin dashboard" width="49%">
  <img src="docs/screen2.png" alt="Munki My Admin management view" width="49%">
</p>

## Highlights

- Manage people with Munki `ClientIdentifier` values based on email.
- Organize people into groups that become Munki manifests.
- Import local `.pkg` files or reference remote package URLs.
- Track package metadata such as Munki name, display name, bundle identifier, version, SHA-256 hash and `.icns` icon.
- Assign packages to people or groups as install or uninstall actions.
- Bulk select and delete people, groups, packages and assignments with confirmation.
- Generate Munki `catalogs`, `manifests`, `pkgsinfo`, `pkgs` and `icons`.
- Download `.mobileconfig` profiles for people and groups.
- Configure the external Munki repository URL from the app.
- Switch the UI between English and French, with browser language detection.

## Screenshots

Place the application screenshots at:

```text
docs/screen1.png
docs/screen2.png
```

The README already references both files, so they will appear automatically on GitHub once the images are added.

## Tech Stack

- Laravel 13
- React 19
- Inertia.js
- Vite
- styled-components
- SQLite
- Docker and Docker Compose

## Local Development

Start the development stack:

```bash
docker compose up --build
```

The app will be available at:

```text
http://localhost:8000
```

Vite runs inside the same container and is exposed on:

```text
http://localhost:5173
```

Default local credentials from `.env`:

```text
admin@example.com
password
```

Run migrations manually if needed:

```bash
docker compose exec app php artisan migrate
```

Install or refresh frontend dependencies inside the container:

```bash
docker compose exec app npm install
```

## Munki Workflow

1. Add people and groups.
2. Add packages with either a local `.pkg` upload or a remote package URL.
3. Assign packages to people or groups.
4. Open the Export view and generate the Munki repo.
5. Point Munki clients to the effective repository URL shown in the app.
6. Use the generated `.mobileconfig` profile for each person or group when needed.

The exported repo is written to `MUNKI_REPO_PATH`, which defaults to:

```text
storage/app/munki_repo
```

In Docker development, the repository is stored in the `munki_repo` volume and exposed through static public links such as:

```text
http://localhost:8000/repo
http://localhost:8000/catalogs/production
http://localhost:8000/catalogs/all
http://localhost:8000/manifests/base
```

## Configuration

Important environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `APP_DISPLAY_NAME` | Name displayed in the sidebar and login screen | `Munki My Admin` |
| `APP_VERSION` | Version displayed in the sidebar footer | `dev` |
| `APP_URL` | Base application URL used to build repository URLs | `http://localhost:8000` |
| `ADMIN_EMAIL` | Admin login email | `admin@example.com` |
| `ADMIN_PASSWORD` | Admin login password | `password` |
| `MUNKI_REPO_PATH` | Local path where the Munki repo is exported | `storage/app/munki_repo` |
| `MUNKI_DEFAULT_CATALOG` | Default catalog name | `production` |
| `MUNKI_BASE_MANIFEST` | Base manifest name | `base` |

The external client-facing URL can also be overridden from the Export page.

## Production

Build and run the production compose file:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Required production environment variables:

```text
APP_KEY=base64:...
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
APP_URL=https://your-domain.example
```

Optional production variables:

```text
APP_PORT=8080
APP_DISPLAY_NAME="Munki My Admin"
APP_VERSION=dev
MUNKI_DEFAULT_CATALOG=production
MUNKI_BASE_MANIFEST=base
```

The production compose file persists SQLite, Laravel storage and the Munki repository with named Docker volumes.

## Build

Build frontend assets locally:

```bash
npm run build
```

Build the production Docker image:

```bash
docker build --target production -t munkimyadmin .
```

## License

This project is open source. Add or update the license file before publishing if you need a specific license.

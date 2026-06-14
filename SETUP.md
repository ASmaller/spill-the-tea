# Setup

This document will guide you through setting up your own instance of **Spill the Tea**.

## Prerequisites

- [Docker Compose](https://docs.docker.com/compose/install)
- A [Gamma Client](https://gamma-docs.olillin.com/#what-is-a-client)

The website requires a Gamma Client with an API key to integrate with Gamma and
enable login. Follow the guide for
[**Creating a User Client**](https://gamma-docs.olillin.com/website/#creating-a-user-client)
in the Gamma documentation.

When creating the client, make sure that _Generate api key_ is checked and
_Redirect url_ is set to the callback route at `https://example.com/callback`
where `example.com` is the domain where the website is hosted. Keep the page
open so you can copy your credentials later.

## Installation

Start by copying the content of [compose.prod.yaml](./compose.prod.yaml) into a
`compose.yaml` file in a new directory.

Fill in the details in angle brackets (`<>`) like the database password and
Gamma Client credentials. Refer to the [Configuration](#Configuration) section
for what the different options mean.

Run this command to start everything for you:

```bash
docker compose up -d
```

To stop the service run:

```bash
docker compose down
```

## Configuration

### Administrators

Administrators are managed through Gamma
[Client Authorities](https://gamma-docs.olillin.com/api/client-api/#client-authorities).
Anyone who has an authority starting with `admin` will be considered an
administrator. See the guide on
[**Creating client authortities**](https://gamma-docs.olillin.com/website/#creating-client-authorities)
in the Gamma documentation.

### Environment Variables

This is a list of available options for the service, exposed as environment
variables.

| Variable               | Required                                                                                                          | Description                                                                                                                       | Default                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `JWT_SECRET`           | Y                                                                                                                 | Secret key used for signing JWT tokens. Generate a random string.                                                                 |                         |
| `DATABASE_URL`         | [Connection URL](https://www.prisma.io/docs/orm/reference/connection-urls) to the database which Prisma will use. |
| `GAMMA_CLIENT_SECRET`  | Y                                                                                                                 | Client secret of the Gamma Client.                                                                                                |                         |
| `GAMMA_CLIENT_ID`      | Y                                                                                                                 | Client id of the Gamma Client.                                                                                                    |                         |
| `GAMMA_API_KEY_ID`     | Y                                                                                                                 | API key id. Found between `pre-shared ` and `:` in the generated `Authorization` header.                                          |                         |
| `GAMMA_API_KEY_SECRET` | Y                                                                                                                 | API key secret. Displayed as "Api key" below the client secret.                                                                   |                         |
| `GAMMA_REDIRECT_URI`   | N                                                                                                                 | Custom redirect URI if the for some reason the default `<BASE_URL>/callback` cannot be used.                                      |                         |
| `BASE_URL`             | N                                                                                                                 | URL where the website is hosted without a path. Such as `https://example.com`.                                                    | `http://localhost:3000` |
| `SKIP_ENV_VALIDATION`  | N                                                                                                                 | Set to `1` to skip validation of environment variables. Used when building the Docker image and should not be used in production. |

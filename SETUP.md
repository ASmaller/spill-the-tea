# Setup

This document will guide you through setting up your own instance of **Spill the Tea**.

## Prerequisites

- [Docker Compose](https://docs.docker.com/compose/install)

## Installation

Start by copying the content of [compose.prod.yaml](./compose.prod.yaml) into a
`compose.yaml` file in a new directory.

Fill in the details in angle brackets (`<>`) like the database password.

Run this command to start everything for you:

```bash
docker compose up -d
```

To stop the service run:

```bash
docker compose down
```

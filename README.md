
# ParkChecker

I used the API provided by https://data.bs.ch to collect parking data from Basel-Stadt and stored it in my MySQL database using the ETL process.

To make access easier, I created an API to bring the data history to my Frontend.




## Demo

https://im-server.ch



## API Reference

#### Get all items

```http
  GET /api
```

#### Get item using LocationID

```http
  GET /api?locationID=${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `locationID`      | `string` | Id of item to fetch |

#### Get limited items using LocationID

```http
  GET /api?locationID=${id}&limit=5
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `locationID`      | `string` | Id of item to fetch |
| `limit`      | `int` | limit the amount of returned rows |

#### Get latest set of Data

```http
  GET /api?latest=true
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `latest`      | `boolean` | Returns rows, that were fetched in the last hour |

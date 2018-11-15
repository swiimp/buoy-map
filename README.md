# Buoy Map

This is my implementation of the specs described within the project brief. The application itself is
made up of three main components: a websocket server, an http server, and a browser app.
Information about buoys and subscriptions is stored primarily on the websocket server with the http
server acting as a middle-man for requesting and serving that info to the end user. From there, the
browser app simply listens for any information on buoys and renders it on the map accordingly.

## Requirements

- Node v8.10.0 or newer

## Installing dependencies

From within the root directory:

```sh
npm install
```

## Running the application

After you have installed the dependencies, within the root directory, create a file named `.env` and
open it in a text editor. Then, copy and paste the following into the file replacing
`YOUR_MAPBOX_ACCESS_TOKEN_HERE` with a Mapbox API access token:

```
MapboxAccessToken='YOUR_MAPBOX_ACCESS_TOKEN_HERE'
```

You may also specify `APP_PORT` and/or `WS_PORT` here to change which ports the app and websocket
servers use and `WS_HOST` to set the host address of the websocket server to which the app server
will attempt to connect. All three of these fields, however, are optional.

Next, run this command from the root directory to build the application Webpack bundle:

```sh
npm run build:prod
```
Alternatively, you can run `npm run build:dev` to build a dev bundle.

Once you have your bundle and your `.env` file is set up according to your configuration, run this
command to spin up the websocket server:

```sh
npm run server:ws
```

And then this command in a separate terminal to start up the application server:

```sh
npm run server:client
```

At this point, you should be able to run the map application in a browser. By default, it is hosted
on `http://localhost:3000`.

## Implementation notes

### Assumptions

While developing this application, I made the following assumptions:

- New buoys are added extremely infrequently
- Buoys should not be overwritten
- Buoys must have unique names

I'll be the first to admit that I don't have any experience setting up a literal buoy but I imagine
they are somewhat static judging by how durable they seem to be at a glance. As for the names, that
was mostly just the impression I got from reading the brief.

- If a buoy's height and period are in two different condition brackets, the lower bracket takes
  priority

I thought about it and figured that it probably wouldn't be very exciting catching a 1 foot wave
with a 12 second period.

- There are probably latitudes and longitudes with a disproportionate amount of buoys on them

My thought was that places like coasts, where there is a clearly defined geographical guideline for
placing buoys, would end up creating situations where there are many buoys along a range of valid
longitudinal axes but not nearly as many along a range of valid latitudinal axes. Hence why I
decided to create indices for both latitude and longitude; in situations where the above is true,
iterating through both ranges could yield a noticeable performance boost.

### Environment Variables

`MapboxAccessToken`: [REQUIRED] The access token required for using Mapbox's map API, the map will
                     not render without it.

`WS_PORT`: [OPTIONAL] The port the websocket server listens on. Defaults to 8080.

`APP_PORT`: [OPTIONAL] The port the application server listens on. Defaults to 3000.

`WS_HOST`: [OPTIONAL] The host address of the websocket server. Defaults to `ws://localhost:8080`.

### Websocket Server

The websocket server is the primary source of information on subscriptions and buoys and is
responsible for handling all JSON-RCP 2.0 function calls.

The data structures used for storage are two hash tables representing the stores for clients and
buoys and two sorted arrays representing indices for the buoys, one indexed by latitude and the
other by longitude. If given more time, I would like to actually refactor the module in order to use
an AVL tree to improve run times on adds from O(N) to O(logN), however, given my working assumption
that insertions would rarely happen, I decided my time was better spent working on other aspects of
the application as a whole. The hash tables work well for this implementation because coupled with
the indices I can get subscriptions in O(logN + M) time where N is total size of the data set and M
is a subset of N consisting only of possibly desired entries cutting out a lot of the chaff from a
simple linear search. Additionally, the hash tables helped a lot with aggregating data for what I
identified as the primary action of this server, notifications; they completely remove the need for
any kind of searching for matching buoys and clients while generating new notifications, once again
improving performance.

More specific documentation can be found within the source files.

### Application Server

The application server is an http server that delegates websockets to socket.io-client sockets in
order to communicate data from the websocket server to the end user as soon as it's available.

Socket.io just seemed like the natural choice for this project; integrating with a websocket
interface presented no real challenges since they both operate on similar principles. Other than
that, this server is pretty simple as it mostly just serves as a coupling mechanism for the app and
the websocket server.

More specific documentation can be found within the source files.

### BuoyMap

BuoyMap serves as the primary way for an end user to view our buoy data.

BuoyMap is comprised of three main components: BuoyMap, Map, and BuoyOverlay. BuoyMap is our
top-level component and mostly handles communication between the client and application server.
Map, as you may have guessed, is our map module. The map itself is powered by MapboxGL's Javascript
SDK and their map API. As the map scrolls, the client resubscribes once the bounds are exceeded. It
is possible to define a pre-caching area outside of the viewport by passing in props. This
ultimately results in less re-subscriptions which can be extremely costly especially if given larger
ranges. BuoyOverlay utilizes the CanvasOverlay component in order to redraw buoys as state is
updated without needing to re-render the entire map which is a huge improvement over alternatives
such as injecting the buoy data into the map's data layers which causes a full map re-render with
each incoming buoyNotification. Improvements that I would like to implement include devising LRU
cache-like system for dumping old buoys client-side and polishing the data display when you mouse
over a buoy.

More specific documentation can be found within the source files.

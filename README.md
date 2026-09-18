# Azure Paradise Resort — WayFinder V3

## New V3 features

### Mobile responsive
- Mobile map fills the screen.
- Left navigation becomes a slide-out drawer.
- ☰ menu opens the drawer.
- × closes the drawer.
- Tapping "Calculate walking route" closes the drawer on mobile.
- Admin Dashboard becomes a full-width slide-in drawer on small screens.

### Place QR system
The Dashboard has a **Place QR Generator**.

Example:
1. Open Dashboard.
2. Select **Reception Area**.
3. A URL is generated like:
   `https://your-domain.com/index.html?place=reception`
4. Download the QR.
5. Put the QR at the Reception entrance.
6. A guest scans it.
7. The guest page opens with **Reception Area** automatically selected as **YOU ARE HERE**.
8. The guest selects a destination, for example Main Restaurant.
9. The route starts from Reception and follows the pathway-only network.

The same concept can be used for Restaurant, Pool, Spa, Yoga Pavilion, Villas, etc.

## Important production note

The generated QR currently uses the URL of the page that generated it. After deployment, generate the QR from the deployed domain so the QR points to your real website.

The routing graph remains a manually digitized prototype from the supplied map. Verify all room doors, entrances and pathway centerlines against the resort's actual architectural/CAD plan before guest deployment.

## Recommended next production phase

Move the place/QR data and pathway graph to Laravel + MySQL:
- `places`
- `qr_codes`
- `floors`
- `route_nodes`
- `route_edges`
- `rooms`
- `room_doors`

Then the Admin Dashboard can create a QR for any place dynamically and the guest URL can be a permanent short link such as:
`/wayfinder/place/reception`.

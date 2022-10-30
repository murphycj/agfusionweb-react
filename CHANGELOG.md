## Unreleased

- Added prettier code formatting.
- Updated README.

## v1.0.3

- Add github actions for CI/CD.
- Update NPM package dependencies and versions.

## v1.0.2

Many fixes to improve the layout and display of the site. Including making it more responsive for various screen sizes:

- fixed header display issue (#6)
- exon/protein plot now resizes with changing screen/browser width
- improved the footer display
- the tables now appropriately deal with small screen widths (#9)
- the data input boxes are now mobile friendly (#9)
- links now open a new tab
- updated to Ant Design v4.5.4

## v1.0.1

Some bug fixes and other minor changes:

- Fixed a bug where 5'UTR sequence of the 3' gene is not included in the fusion CDS when the junction is in the 5'UTR of the 3' gene (#4 ). This can cause the predicted frame of the fusion to be incorrect.
- Changed `in-frame (with mutation)` to just `in-frame` to reduce confusion.
- Other minor changes such as adding a link to the

## v1.0.0

- polyfill fixes for internet explorer (#2 #1 )
- bug downloading image while on internet explorer
- handled potential input error for starfusion (#3 )

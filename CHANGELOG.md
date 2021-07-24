# ts-mailgun

## [0.5.1] Jul-24-2021

### Fixes
- npm update

## [0.5.0] Mar-31-2021 - Mailgun Templates

### Additions
- [PR-42] Adding the possibility to send an email with a template stored in mailgun

### Fixes
- npm update


## [0.4.3] Sep-13-2020 - Repackage

### Fixes
- [Issue #36] Dependency breaks CI builds
- npm update

## [0.4.2] Mar-29-2020

### Fixes
- npm update

## [0.4.1] Feb-01-2020

### Fixes
- npm update

## [0.4.0] Dec-02-2019

### Additions
- [Issue #31] Add documentation about accessing Mailgun member directly
- [Issue #29] Add send() options parameter
- [Issue #28] Add npm keywords
- [Issue #27] Add Mailgun custom options

### Fixes
- [Issue #26] Change host to 'api.eu.mailgun.net'
- [Issue #25] Update TravisCI Node version
- [Issue #10] Should not call list api in testMode
- npm update

## [0.3.9] Nov-22-2019

### Fixes
- npm update

## [0.3.8] Nov-12-2019

### Fixes
- Fixed readme typos
- Add `.prettierrc`
- npm update

## [0.3.7] Oct-01-2019

### Fixes
- npm update

## [0.3.6] Jul-15-2019

### Fixes
- Updated dependency with security update `lodash`
- Updated dependencies

## [0.3.5] May-07-2019

Added author credit

## [0.3.3] May-07-2019

### Fixes
- [Issue #20] Change license in package.json
- npm update

## [0.3.2] Mar-28-2019

### Fixes
- [Issue #18] sendFromTemplate() fails to properly copy payload
- [Issue #17] listSend() doubles header & footer

## [0.3.1] Mar-26-2019 - npm publish

### Fixes
- npm publish
- Updated install instructions

## [0.3.0] Mar-26-2019

### Additions
- [Issue #13] sendFromTemplate() should compile process.env variables
- [Issue #14] Add functions to load header & footer from html template files

### Fixes
- [Issue #12] Unsubscribe false appends 'undefined' to body
- npm update

## [0.2.0] Mar-08-2019

### Additions

- [Issue #5] Add testing mode
- [Issue #8] Add templates

### Fixes

- [Issue #4] [Readme] Complete example - undefined 'users'
- [Issue #6] listRemove() does not remove the user
- [Issue #7] listSend() should send single email to mailing list

## [0.1.1] Jan-18-2019

### Fixes

- Readme clean-up
- Changed package index import file

## [0.1.0] Jan-18-2019

### Additions
- Added unsubscribeLink member
- Added listSend()
- Added getListAddresses()
- Added templateVars to send()
- send() can take array of addressees
- Added listRemove()
- Added listUpdate()
- Added listAdd()
- Added getList()
- Added initMailingList()
- Added list member to NodeMailgun

### Fixes
- Cleaned up readme
- Strong-typed mailgun member
- Strong-typed method return values
- send() should not be async
- Promise reject() should also return

## [0.0.1] Jan-17-2019

Initial Release

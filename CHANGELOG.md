# node-mailgun

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

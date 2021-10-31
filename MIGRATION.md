# Migration Guide

## [0.x.x] -> [1.x.x]

This version switches from `mailgun-js` to `mailgun.js`, since the former is now deprecated. ts-mailgun attempts to transition without any breaking changes; but if you are accessing `NodeMailgun.mailgun` or `NodeMailgun.list` directly, you may face breaking changes.

### Responses
- Response bodies may have changed. If you are utilizing returned response bodies from any function, the output may have changed.

### getList()
- Previously, this method returned an object with an `items` array and an `items_count`. Now, just an array will be returned

### Generic Requests
- Generic Requests are no longer supported. Please instead report any missing functionality on https://github.com/StatelessStudio/ts-mailgun/issues

### Attachments
- You must now use `new Attachment()` instead of `mailgun.Attachment()` (exported from `ts-mailgun`)
- `knownLength` and `contentType` options are no longer supported
```typescript
import { NodeMailgun, Attachment } from 'ts-mailgun';
...
attachment: new Attachment({
	data: '~/Downloads/jpg.png',
	filename: 'bob.png'
})
```

### NodeMailgun.options
If you are using `NodeMailgun.options` directly, the following options are no longer supported:

- **mute**: This is no longer necessary and can be removed
- **retry** This option is not currently supported
- **proxy** The behavior has changed to instead change the API URL to this proxy address

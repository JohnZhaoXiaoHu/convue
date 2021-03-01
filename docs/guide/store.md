# Global store

Convue will load the .js|.ts file in the /src/store directory by default and configure it automatically in vuex.

The content structure of the file is unified with vuex, as follows

```js
export default {
   state: () => (()),
   mutations: {},
   actions: {},
   getters: {},
};
```

## Description

The index[.js|.ts] under /src/store will load the vuex item directly, and other files will be configured in the form of modules.

For example, there are two files index.js and user.js.

index.js

```js
export default {
   state: () => ({
     text:'hello',
   }),
};
```

user.js

```js
export default {
   state: () => ({
     name:'convue',
   }),
};
```

Then the vuex store is actually this structure

```js
export default {
   state: () => ({
     text:'hello',
   }),
   modules: {
     user: {
       state: () => ({
         text:'convue',
       }),
     },
   },
};
```

For other rules, please [refer to store configuration items](/convue/config/store).

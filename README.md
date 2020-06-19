Done:

- First is simple. Update pakages
- Change Authentication to the { AmplifyAuthenticator } from '@aws-amplify/ui-react' insead of import { Authenticator } from 'aws-amplify-react'
- Сhanged styles a bit
- Delete { Connect } from 'aws-amplify-react' and fetch marketList using API.graphql with creating of subscription onCreateMarket
- Change identityField to identityClaim in schema.graphql because identityField deprecated
- Changed date-fns to v2

ToDo:

- Change UI library. "element-react" has not been updated for a year and gives a lot of messages in the console
- Convert to React Hooks
- Think about { PhotoPicker } and { S3Image } from 'aws-amplify-react'. They have no alternative in new '@aws-amplify/ui-react'
- Write a good readme
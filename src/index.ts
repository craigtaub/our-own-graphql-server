import express, {Request, Response} from 'express';
import ourGraphQlServer from './graphql-server';
import schema from '../artifacts/schema.json';

console.log('schema', schema)
// schema './artifacts/schema.graphql',

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!' + ourGraphQlServer);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
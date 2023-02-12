import styles from '@/styles/Home.module.css'
import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <Head>
        <title>Todo List</title>
        <meta name="description" content="Todo list." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Hello World</h1>
      </main>
    </>
  )
}

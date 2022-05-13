import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;
    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));
    return total;
  }, 0);
  const readTime = Math.ceil(totalWords / 200);

  const posts = post.data;

  const formattedData = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    { locale: ptBR }
  );

  return (
    <>
      <Head>
        <title> {post.data.title} | Rockeseat Desafio </title>
      </Head>

      <img
        className={styles.bannerImg}
        src={post.data.banner.url}
        alt="banner"
      />
      <section className={styles.container}>
        <div className={styles.contentTitle}>
          <h1> {posts.title} </h1>
          <span>
            <FiCalendar /> {formattedData}
          </span>
          <span>
            <FiUser /> {posts.author}
          </span>
          <span>
            <FiClock /> {readTime} min
          </span>
        </div>

        {posts.content.map(post => {
          return (
            <div key={post.heading} className={styles.contentText}>
              <h2> {post.heading} </h2>
              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(post.body) }}
              />
              ) )
            </div>
          );
        })}
      </section>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  console.log(paths);

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});

  const { slug } = params;
  const response = await prismic.getByUID('post', String(slug), {});

  const posts = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  const post = posts;

  return {
    props: { post },
  };
};

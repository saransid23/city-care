import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PAGE_CONTENT } from '../data/pageContent';
import PageTransition from '../components/PageTransition';

export default function InfoPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const content = PAGE_CONTENT[pageId] || PAGE_CONTENT['default'];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageId]);

  return (
    <PageTransition>
      <main className="info-page-container">
        <div className="info-card">
          <h1 className="animate-slide-up">{content.title}</h1>
          <div className="title-divider animate-slide-up delay-1"></div>
          <p className="animate-slide-up delay-2">{content.description}</p>
          
          <button className="btn btn-primary animate-slide-up delay-3" onClick={() => navigate('/')} style={{ marginTop: '32px' }}>
            ← Back to Home
          </button>
        </div>
      </main>
    </PageTransition>
  );
}

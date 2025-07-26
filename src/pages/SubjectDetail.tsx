import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  FileText,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subjectDatabase } from '@/data/subjectData';
import OfflineStorage from '@/utils/offlineStorage';
import { useOfflineData } from '@/hooks/useOfflineData';

interface SubjectCategory {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  id: string;
}

export const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const subject = subjectDatabase[subjectId || ''];
  
  // Use offline data hook for better offline support
  const { 
    data: cachedSubject, 
    isOffline, 
    updateData 
  } = useOfflineData(`subject_${subjectId}`, undefined, [subjectId]);

  // Cache subject data when component loads
  useEffect(() => {
    if (subject && subjectId) {
      OfflineStorage.cacheSubjectData(subjectId, subject);
      OfflineStorage.cacheResourceUrls(subjectId, subject.urls);
      updateData(subject);
    }
  }, [subject, subjectId, updateData]);

  const categories: SubjectCategory[] = [
    {
      id: 'syllabus',
      icon: BookOpen,
      title: 'সিলেবাস',
      description: 'সম্পূর্ণ পাঠ্যক্রম ও বিষয়বস্তু',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'markedBooks',
      icon: Bookmark,
      title: 'দাগানো বই',
      description: 'প্রস্তাবিত পাঠ্যবই ও গাইড',
      color: 'bg-green-50 border-green-200',
    },
    {
      id: 'chapterClasses',
      icon: Video,
      title: 'অধ্যায়ভিত্তিক ক্লাস',
      description: ' ওয়ান শর্ট ভিডিও',
      color: 'bg-orange-50 border-orange-200',
    },
    {
      id: 'chapterNotes',
      icon: FileText,
      title: 'অধ্যায়ভিত্তিক নোট',
      description: 'বিস্তারিত নোট ও সারাংশ',
      color: 'bg-purple-50 border-purple-200',
    },
  ];

  // Use cached data if available when offline
  const displaySubject = subject || cachedSubject;
  
  if (!displaySubject) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-md w-full shadow-lg">
          {isOffline && (
            <div className="mb-4 p-2 bg-orange-100 text-orange-800 rounded text-sm">
              📱 অফলাইন মোড - ক্যাশ করা ডেটা দেখানো হচ্ছে
            </div>
          )}
          <h2 className="text-xl font-bold mb-4">বিষয় খুঁজে পাওয়া যায়নি</h2>
          <p className="text-gray-600 mb-4">
            দুঃখিত, এই বিষয়ের তথ্য এখনো যোগ করা হয়নি। শীঘ্রই আপডেট করা হবে।
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Subject ID: {subjectId}
          </p>
          <Button onClick={() => navigate(-1)} className="w-full">
            ফিরে যান
          </Button>
        </Card>
      </div>
    );
  }

  const handleCategoryClick = (categoryId: string) => {
    const url = displaySubject.urls?.[categoryId as keyof typeof displaySubject.urls];
    if (url) {
      // Cache the URL access for offline reference
      OfflineStorage.setItem(`last_accessed_${subjectId}_${categoryId}`, {
        url,
        timestamp: Date.now(),
        categoryId,
        subjectId
      });
      window.open(url, '_blank');
    } else {
      console.log(`No URL found for ${categoryId} in subject ${subjectId}`);
      // You can show a toast or alert here if needed
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b p-4 shadow-sm">
        {isOffline && (
          <div className="mb-2 p-2 bg-blue-100 text-blue-800 rounded text-sm text-center">
            📱 অফলাইন মোড - সংরক্ষিত তথ্য দেখানো হচ্ছে
          </div>
        )}
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {displaySubject.mainSubject}
            </h1>
            {displaySubject.paper && (
              <p className="text-sm text-gray-500">{displaySubject.paper}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const hasUrl = displaySubject.urls?.[category.id as keyof typeof displaySubject.urls];
            return (
              <Card
                key={category.id}
                className={`p-4 transition-all duration-300 ${category.color} border rounded-xl shadow-sm hover:shadow-md cursor-pointer hover:scale-105 ${
                  !hasUrl ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-white shadow-sm">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  {!hasUrl && (
                    <p className="text-xs text-gray-400 mt-2">শীঘ্রই আসছে</p>
                  )}
                  {isOffline && hasUrl && (
                    <p className="text-xs text-green-600 mt-2">✓ অফলাইনে উপলব্ধ</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

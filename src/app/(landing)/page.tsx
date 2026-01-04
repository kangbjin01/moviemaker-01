import { type Metadata } from "next";
import Link from "next/link";
import { Film, FileText, Download, Users, Zap, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "MovieMaker - 영화 프로덕션 일일촬영계획표",
  description:
    "영화 및 영상 프로덕션을 위한 일일촬영계획표 작성 서비스. 웹에서 편리하게 입력하고, PDF와 엑셀로 출력하세요.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm mb-8">
              <Film className="h-4 w-4" />
              <span>영화 프로덕션 매니지먼트</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              일일촬영계획표를
              <br />
              <span className="text-muted-foreground">더 스마트하게</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              영화 및 영상 프로덕션을 위한 일일촬영계획표를 웹에서 편리하게 작성하고,
              PDF와 엑셀로 바로 출력하세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/call-sheet">
                <Button size="lg" className="w-full sm:w-auto text-base">
                  일촬표 작성 시작
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/call-sheet">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                  둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              프로덕션에 필요한 모든 것
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              복잡한 촬영 일정을 체계적으로 관리하고, 팀과 효율적으로 공유하세요.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">직관적인 입력</h3>
              <p className="text-muted-foreground">
                씬 정보, 출연진, 장소, 시간 등 모든 정보를 웹에서 편리하게 입력하세요.
                드래그앤드롭으로 촬영 순서도 쉽게 조정할 수 있습니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">PDF & 엑셀 출력</h3>
              <p className="text-muted-foreground">
                작성한 일촬표를 가로 A4 PDF 또는 엑셀 파일로 바로 출력하세요.
                현장에서 바로 프린트해서 사용할 수 있습니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">팀 협업 (Coming Soon)</h3>
              <p className="text-muted-foreground">
                조연출, 촬영감독, 제작부 모두가 실시간으로 일촬표를 확인하고
                수정 사항을 즉시 공유할 수 있습니다.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">자동 정보 입력</h3>
              <p className="text-muted-foreground">
                촬영 날짜를 입력하면 일출/일몰 시간, 날씨 예보 등 기본 정보가
                자동으로 입력됩니다. (MVP에서 순차 지원)
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6">
                <Film className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">현장 운용 모드 (Coming Soon)</h3>
              <p className="text-muted-foreground">
                촬영 현장에서 모바일로 일촬표를 확인하고, 실시간으로 진행 상황을
                업데이트하세요. 촬영 순서 변경도 즉시 반영됩니다.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">템플릿 저장</h3>
              <p className="text-muted-foreground">
                자주 사용하는 양식을 템플릿으로 저장하고, 새 프로젝트에서
                빠르게 불러와 사용하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              복잡한 가입 절차 없이 바로 일촬표를 작성할 수 있습니다.
            </p>
            <Link href="/call-sheet/create">
              <Button size="lg" className="text-base">
                새 일촬표 만들기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              <span className="font-semibold">MovieMaker</span>
            </div>
            <p className="text-sm text-muted-foreground">
              영화 프로덕션을 위한 스마트 도구
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

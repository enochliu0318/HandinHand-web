import Link from "next/link";
import { auth } from "@/lib/auth";
import { PublicLayout } from "@/components/layouts";
import { IOSCard, IOSButton } from "@/components/ui/ios";
import { GraduationCap, Users, BookOpen, Heart } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <PublicLayout session={session}>
      {/* Hero */}
      <section className="text-center py-8">
        <div className="w-20 h-20 bg-ios-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <Heart className="w-10 h-10 text-ios-blue" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">大手拉小手</h1>
        <p className="text-ios-gray text-base leading-relaxed max-w-sm mx-auto">
          大孩子教小孩子，传递知识与温暖。浏览优秀学长学姐的简历，为孩子找到最合适的辅导老师。
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: GraduationCap, label: "优秀老师", value: "10+" },
          { icon: Users, label: "受益学生", value: "50+" },
          { icon: BookOpen, label: "授课节数", value: "200+" },
        ].map((item) => (
          <IOSCard key={item.label} className="text-center py-4">
            <item.icon className="w-6 h-6 text-ios-blue mx-auto mb-2" />
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-xs text-ios-gray mt-0.5">{item.label}</p>
          </IOSCard>
        ))}
      </div>

      {/* CTA */}
      <IOSCard className="mb-6">
        <h2 className="text-lg font-semibold mb-2">寻找合适的老师</h2>
        <p className="text-sm text-ios-gray mb-4">
          浏览各位学长学姐的简历，了解他们的擅长科目和教学经验。
        </p>
        <Link href="/teachers">
          <IOSButton fullWidth>浏览老师简历</IOSButton>
        </Link>
      </IOSCard>

      {/* Features */}
      <div className="space-y-3">
        <p className="text-xs text-ios-gray uppercase tracking-wide px-1">
          项目特色
        </p>
        {[
          {
            title: "学长学姐授课",
            desc: "高中生志愿者一对一辅导小学生",
          },
          {
            title: "科目丰富",
            desc: "数学、英语、语文、编程等多科目覆盖",
          },
          {
            title: "全程记录",
            desc: "每节课均有记录，家长可随时查看",
          },
        ].map((item) => (
          <IOSCard key={item.title} className="flex gap-3 items-start">
            <div className="w-2 h-2 rounded-full bg-ios-blue mt-2 shrink-0" />
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-ios-gray">{item.desc}</p>
            </div>
          </IOSCard>
        ))}
      </div>
    </PublicLayout>
  );
}

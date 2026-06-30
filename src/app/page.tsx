import Link from "next/link";
import { auth } from "@/lib/auth";
import { PublicLayout } from "@/components/layouts";
import { IOSButton } from "@/components/ui/ios";
import { Heart } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <PublicLayout session={session}>
      <section className="text-center py-12">
        <div className="w-16 h-16 bg-ios-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <Heart className="w-8 h-8 text-ios-blue" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">大手拉小手</h1>
        <p className="text-ios-gray text-base leading-relaxed max-w-xs mx-auto mb-8">
          大孩子教小孩子，为孩子找到合适的辅导老师。
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link href="/teachers">
            <IOSButton fullWidth size="lg">
              浏览老师
            </IOSButton>
          </Link>
          <Link href="/apply">
            <IOSButton fullWidth size="lg" variant="secondary">
              申请账号
            </IOSButton>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

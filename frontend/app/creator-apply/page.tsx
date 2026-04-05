"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, CheckCircle2, Sparkles, Package, Users, Megaphone, Truck, Handshake, Home, PartyPopper } from "lucide-react"
import Link from "next/link"

const productCategories = [
  "T-shirt / 上衣",
  "帽子",
  "托特包 / 袋類",
  "襪子",
  "貼紙",
  "明信片",
  "海報",
  "筆記本 / 文具",
  "手機殼",
  "馬克杯 / 杯墊",
  "鑰匙圈 / 吊飾",
  "抱枕",
  "地墊",
  "其他（請於創作理念欄補充說明）"
]

const contractContent = `Artniverse 創作者合約書

藝術宇宙文創孵化有限公司（以下簡稱甲方）
申請合作品牌（以下簡稱乙方）

緣甲、乙雙方願本於誠信原則進行合作，由乙方授權其著作與甲方進行商品製造及品牌推廣活動並擔任甲方之專屬設計師，俾提升雙方之品牌形象與業務拓展，創造互惠雙贏成果，爰本於誠信互利之基礎訂立條款如下（下稱本合約）：

第一條 授權範圍

一、乙方應於本合約存續期間，將其自行創作（其範圍得經乙方以Email方式提供圖檔增加）所示著作（下稱系爭著作）之著作財產權授權甲方不受時間、地域、次數，於履行本合約之目的內進行利用，包含重製、公開播送、公開展示、改作、編輯、出租、公開傳輸、散布、相關產品之發行及販售，並承諾不對甲方行使著作人格權。

二、本合約為獨家授權，乙方於本合約存續期間內不得未經甲方同意將系爭著作授權與第三人作同品項的產品生產，如有違反願賠償甲方懲罰性違約金新台幣五千元，並立即銷毀乙方私自授權生產之產品，本約定就懲罰性違約金部分經公證後得逕付強制執行。

三、乙方應擔保所提供之系爭著作及與系爭著作相關之素材並無侵犯他人智慧財產權及任何法律上權利之虞，如侵害他人之權利或有違法之瑕疵，乙方應自行承擔一切相關民、刑事法律責任（包含但不限於賠償律師費、法院裁判費）。

四、乙方如因前項事由導致甲方形象受損或有其他財產上及非財產上損害，甲方除得向乙方追究民、刑事責任外，尚得向乙方請求懲罰性違約金新臺幣十萬元，本約定就懲罰性違約金部分經公證後得逕付強制執行。

五、乙方於本合約存續期間授權甲方利用系爭著作所為之一切行為（包含但不限於甲方發布以系爭著作重製之網路貼文、影片、照片、音訊、文字、主視覺等），其授權效力不因本合約存續期間屆至而受影響，乙方不得請求甲方刪除、銷毀，亦不得對之提起民、刑事訴訟，但本合約另有約定者不在此限。

六、乙方同意甲方於本合約存續期間屆至後得保留系爭著作素材作為參加民間及政府創業競賽、甲方品牌行銷之用。

第二條 合作方式

一、商品產銷
1. 甲方得使用系爭著作進行商品（下稱商品）之產銷（即生產、銷售），並有權決定與商品產銷相關（包含但不限於商品售價、通路）之一切事項。
2. 甲方利用系爭著作為商品之產銷前應告知乙方商品之生產成本、種類並檢附商品之成品示意圖或樣品與乙方，經乙方同意後始得為之，惟乙方收受甲方前項通知後 3 日內未為答覆者即視為乙方同意之。
3. 乙方依前款同意甲方為商品產銷後不得任意請求終止，但乙方得依本合約第六條第二項終止本合約時不在此限。
4. 本合約期限已屆至，且甲、乙雙方並未依本合約第五條續約時，乙方應同意甲方無限期銷售剩餘之庫存品至售完為止或請求甲方將前開庫存品下架，但乙方請求下架庫存品時，應以生產成本加計 3 成之價格購買上開庫存品之全部；如甲、乙雙方於本合約屆至後 5 日內未能就庫存品之處理方式達成合意且因可歸責乙方之事由致未能執行完畢者，視為乙方同意甲方無限期銷售庫存品直至售完為止。
5. 乙方依本合約第六條第二項終止本合約時，得請求甲方銷毀尚未銷售完畢之商品。
6. 甲方於本合約存續期間產銷之商品自本合約終止後即為絕版品，乙方非經甲方同意不得自行產銷，如有違反願賠償甲方懲罰性違約金新臺幣五千元，並立即銷毀乙方私自授權生產之產品，本約定就懲罰性違約金部分經公證後得逕付強制執行。

二、商業活動合作
1. 甲方及第三人因共同進行商業活動有設計著作之需求時，得說明商業活動內容並經乙方同意後，請求乙方擔任甲方於該商業活動之專屬設計師，乙方應依甲方及該第三人之需求為著作之設計及授權；乙方因商業活動設計之著作視為系爭著作之一部，但該著作賣斷與第三人者不在此限。
2. 乙方同意擔任前款商業活動之專屬設計師後，應忠實協助甲方履行與商業活動相關之一切義務（包含與第三人間因該商業活動所生之保密義務），縱本合約之存續期間於商業活動結束前已屆至者亦同，如因可歸責乙方之事由致甲方受有損害，乙方應負損害賠償責任（包含但不限於律師費、法院裁判費）。
3. 未經甲方同意，乙方不得私下聯繫與甲方具合作關係之第三人進行合作，如有違反，甲方除得依本合約第六條終止合約並請求損害賠償外，尚得請求乙方因該合作所得報酬之十倍作為懲罰性違約金。

三、商品產銷及商業活動合作並行
甲方因與第三人共同進行商業活動而同時有商品產銷及著作設計之需求時，其「商品產銷」及「著作設計」部分分別依本條第一、二約定執行之，但甲、乙雙方另有約定者不在此限。

第三條 分潤

一、商品產銷
1. 甲方得自由決定商品售價，並於商品出售時，以出售價格扣除生產成本後將剩餘所得之 2 成分潤與乙方取得，其餘利潤由甲方取得。
2. 乙方得以成本價加計 3 成向甲方購買商品後自行銷售或委託甲方銷售。乙方自行銷售者，其銷售所得利潤由乙方全數取得，乙方委託甲方銷售者，於商品出售時應給付商品售價之 1 成與甲方作為服務費。未經甲方同意，乙方銷售商品之價格不得低於銷售時甲方於官網標示之商品售價。
3. 商品如經甲方出售，甲方應於次月 16 日前提供售出商品數據於本網站之個人頁面中供乙方確認，經乙方確認無誤後，乙方可自行於網站上選擇是否將利潤匯至乙方申報之指定帳戶。

二、商業活動合作
1. 甲方因商業活動自第三人取得之利潤時，除有另外約定或特殊案件外，應扣除稅務成本後分配 9 成與乙方，經乙方確認無誤後，於收受該利潤後 7 日前於本網顯示至乙方錢包內，其餘利潤由甲方取得。
2. 乙方除前款利潤外，不得向甲方請求其他設計費用。

三、商品產銷及商業活動合作並行
甲方因與第三人共同進行商業活動而同時有商品產銷及著作設計之需求時，其「商品產銷」及「著作設計」部分之分潤分別依本條第一、二約定執行之，但甲、乙雙方另有約定者不在此限。

第四條 終止合約

一、甲、乙雙方非經他方同意，不得任意終止本合約。
二、甲、乙雙方有違反本合約之事由時，守約方應訂30日以上期間催告違約方改善，違約方逾期未改善者，守約方得終止本合約並請求損害賠償（包含但不限於律師費、法院裁判費）及懲罰性違約金新台幣十萬元，但懲罰性違約金數額於本合約另有約定者不在此限，本約定就懲罰性違約金部分經公證後得逕付強制執行。

第五條 合約轉讓

甲、乙雙方未經他方同意，不得將本合約之全部或一部轉讓與第三人。

第六條 合約變更

本合約未經甲、乙雙方同意，不得修改。

第七條 保密義務

甲、乙雙方同意，除非係基於法院命令或其他法令之要求，就有關本合約簽署之內容應嚴格保密，並承諾不得以任何方式（包括但不限於社交媒體平臺譬如 Facebook、Twitter、YouTube、部落格及相似之平臺）披露、散佈或公開（不論以印刷、廣播或數位形式包含網路為之）本合約之內容，包括但不限於本合約任一方當事人之身分、本合約條款、簽署後之處置、達成協議前之任何協商內容或與本事件有關之一切事項，亦承諾不向媒體或第三人提供任何訊息或為任何評論，如有違反，除願給付他方懲罰性賠償金新台幣十萬元外，並願按本合約第六條第二項賠償他方所受之損害（包含但不限於律師費、法院裁判費），本約定就懲罰性違約金部分經公證後得逕付強制執行。

第八條 準據法及管轄

本合約以中華民國法律為準據法，甲、乙雙方因本合約涉訟時，同意以臺灣臺北地方法院為一審管轄法院。

第九條 合約份數

本合約一式二份，由甲、乙雙方各執一份為據。

立約人
甲方：藝術宇宙文創孵化有限公司
統一編號：60670422
地址：屏東縣長治鄉長興路 406 號`

export default function CreatorApplyPage() {
  const [formData, setFormData] = useState({
    email: "",
    realName: "",
    brandName: "",
    storePickup: "",
    phone: "",
    birthday: "",
    address: "",
    bankCode: "",
    bankAccount: "",
    selectedCategories: [] as string[],
    creativePhilosophy: "",
    idFrontImage: null as File | null,
    idBackImage: null as File | null,
    agreeToContract: false,
  })
  const [isContractOpen, setIsContractOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: checked
        ? [...prev.selectedCategories, category]
        : prev.selectedCategories.filter(c => c !== category)
    }))
  }

  const handleFileChange = (field: "idFrontImage" | "idBackImage", file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <UniverseBackground />
        <Navigation />
        <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-12">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                感謝您的填寫！
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                我們很期待能與您攜手，一起把創意變成美好的作品。
              </p>
              <p className="text-foreground mb-8">
                請私訊{" "}
                <a
                  href="https://www.instagram.com/artniverse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Artniverse IG
                </a>{" "}
                討論後續
              </p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90">
                  <Home className="w-4 h-4 mr-2" />
                  返回首頁
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <UniverseBackground />
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              加入創作者行列
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              申請成為創作者
            </h1>
          </div>

          {/* Introduction Section */}
          <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 mb-8">
            <div className="space-y-4 text-foreground">
              <p className="text-xl">
                嗨，親愛的創作者您好！
              </p>
              <p className="text-muted-foreground leading-relaxed">
                我們正在尋找熱愛畫畫、設計、創作的你。
                無論你是剛起步的原創角色創作者，或是已經有豐富角色故事線的老手，還是想法豐富的藝術家們，我們都想成為你品牌夢想的起點與專屬的品牌營運夥伴
              </p>
              <p className="text-muted-foreground leading-relaxed">
                我們提供製作資源、平台曝光與分潤機制，協助你打造屬於自己的品牌小店與商品形象！
                讓你的作品不再只是興趣，而是真正能被看見、被喜歡，甚至成為收入來源的可能。
              </p>

              {/* What we provide */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-foreground">我們提供什麼？</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { icon: Package, text: "幫你將作品製作成實體商品（如服飾、包袋等）" },
                    { icon: Sparkles, text: "規劃不同品牌收益方式" },
                    { icon: Users, text: "建立完整的培訓系統" },
                    { icon: Truck, text: "處理出貨、客服與後勤" },
                    { icon: Handshake, text: "對接各式企業聯名" },
                    { icon: PartyPopper, text: "提供空間與主題聚會結交其他創作者" },
                    { icon: Megaphone, text: "透過空間設計與主題展覽創造品牌識別與知名度" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/10 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  填寫完後團隊會以 Email 或 Instagram 與你聯繫
                </p>
                <p className="text-foreground mt-2">
                  這裡，是你藝術事業的跳板。讓你在空閒之餘，用創作讓更多人看見你、支持你，也為你累積一份屬於自己的品牌價值與收入。
                </p>
              </div>

              <p className="text-muted-foreground text-sm mt-4">
                感謝您對 Artniverse 的支持與信任！請依序填寫以下資料，協助我們更了解您的創作及合作需求。期待與您一起，將作品推向更多人，打造屬於您的品牌與商品！
              </p>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">基本資料</h2>
              <div className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    電子郵件 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Real Name */}
                <div className="space-y-2">
                  <Label htmlFor="realName" className="text-foreground">
                    真實姓名 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="realName"
                    type="text"
                    required
                    placeholder="請輸入真實姓名"
                    value={formData.realName}
                    onChange={e => setFormData(prev => ({ ...prev, realName: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Brand Name */}
                <div className="space-y-2">
                  <Label htmlFor="brandName" className="text-foreground">
                    品牌名稱 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="brandName"
                    type="text"
                    required
                    placeholder="請輸入您的品牌名稱"
                    value={formData.brandName}
                    onChange={e => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Store Pickup */}
                <div className="space-y-2">
                  <Label htmlFor="storePickup" className="text-foreground">
                    店到店收件門市 <span className="text-red-400">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    請填寫完整店名，範例：7-11 復興門市 或 全家大安店
                  </p>
                  <Input
                    id="storePickup"
                    type="text"
                    required
                    placeholder="7-11 復興門市"
                    value={formData.storePickup}
                    onChange={e => setFormData(prev => ({ ...prev, storePickup: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    聯絡電話 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="0912-345-678"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Birthday */}
                <div className="space-y-2">
                  <Label htmlFor="birthday" className="text-foreground">
                    生日 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="birthday"
                    type="date"
                    required
                    value={formData.birthday}
                    onChange={e => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground">
                    地址 <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    required
                    placeholder="請輸入完整地址"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">收款資訊</h2>
              <div className="space-y-6">
                {/* Bank Code */}
                <div className="space-y-2">
                  <Label htmlFor="bankCode" className="text-foreground">
                    銀行代碼 <span className="text-red-400">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    例：郵局 700，台新銀行 812。請填寫完整：「銀行名稱 + 代碼」
                  </p>
                  <Input
                    id="bankCode"
                    type="text"
                    required
                    placeholder="郵局 700"
                    value={formData.bankCode}
                    onChange={e => setFormData(prev => ({ ...prev, bankCode: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                {/* Bank Account */}
                <div className="space-y-2">
                  <Label htmlFor="bankAccount" className="text-foreground">
                    收款帳號 <span className="text-red-400">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    僅用於分潤匯款，請放心填寫。請提供您的銀行或郵局帳號，我們會依此將合作收益匯入。
                  </p>
                  <Input
                    id="bankAccount"
                    type="text"
                    required
                    placeholder="請輸入收款帳號"
                    value={formData.bankAccount}
                    onChange={e => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                  <p className="text-xs text-primary flex items-center gap-1 mt-2">
                    <span>📌</span> 此資訊僅用於內部結帳用途，不會外洩或用作他途。
                  </p>
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">想合作的產品類別</h2>
              <p className="text-sm text-muted-foreground mb-6">
                請選擇您有興趣製作的產品類型，選完後歡迎主動與我們聯繫！如果您有其他想法，也非常歡迎和我們討論
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productCategories.map(category => (
                  <div key={category} className="flex items-center space-x-3">
                    <Checkbox
                      id={category}
                      checked={formData.selectedCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                    />
                    <Label htmlFor={category} className="text-sm text-muted-foreground cursor-pointer">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <a
                  href="https://drive.google.com/file/d/12IIxzQ14ds_mnY4dSuYUhuydbHwfWs8O/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  查看完整產品類別說明
                </a>
              </div>
            </div>

            {/* Creative Philosophy */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">創作理念</h2>
              <p className="text-sm text-muted-foreground mb-6">
                請簡短說明您的創作理念。告訴我們你的作品想傳達什麼故事、情感或理念，讓我們更了解你的創作背景。
              </p>
              <Textarea
                placeholder="分享您的創作故事、靈感來源、想傳達的理念..."
                value={formData.creativePhilosophy}
                onChange={e => setFormData(prev => ({ ...prev, creativePhilosophy: e.target.value }))}
                className="bg-background/50 border-border/50 min-h-[150px]"
                required
              />
            </div>

            {/* ID Upload */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">身份證明文件</h2>
              <p className="text-sm text-muted-foreground mb-6">
                身份證正反面照片上傳，核對身分及後續領款手續申報用
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Front */}
                <div className="space-y-3">
                  <Label className="text-foreground">身份證正面 <span className="text-red-400">*</span></Label>
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="idFront"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileChange("idFrontImage", e.target.files?.[0] || null)}
                      required
                    />
                    <label htmlFor="idFront" className="cursor-pointer">
                      {formData.idFrontImage ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm">{formData.idFrontImage.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">點擊上傳身份證正面</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* ID Back */}
                <div className="space-y-3">
                  <Label className="text-foreground">身份證反面 <span className="text-red-400">*</span></Label>
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="idBack"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileChange("idBackImage", e.target.files?.[0] || null)}
                      required
                    />
                    <label htmlFor="idBack" className="cursor-pointer">
                      {formData.idBackImage ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm">{formData.idBackImage.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">點擊上傳身份證反面</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Agreement */}
            <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">合約同意</h2>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToContract"
                  checked={formData.agreeToContract}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, agreeToContract: checked as boolean }))
                    if (checked) {
                      setIsContractOpen(true)
                    }
                  }}
                  required
                />
                <div className="flex-1">
                  <Label htmlFor="agreeToContract" className="text-foreground cursor-pointer">
                    我已閱讀並同意{" "}
                    <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-primary hover:underline font-medium">
                          Artniverse 創作者合約書
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-primary/20">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-foreground">
                            Artniverse 創作者合約書
                          </DialogTitle>
                        </DialogHeader>
                        <div className="prose prose-sm prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                            {contractContent}
                          </pre>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-border/50">
                          <Button
                            type="button"
                            onClick={() => setIsContractOpen(false)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            我已閱讀完畢
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <span className="text-red-400"> *</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    請仔細閱讀合約內容，勾選後即表示您同意合約條款
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-lg rounded-full"
                disabled={!formData.agreeToContract}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                提交申請
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

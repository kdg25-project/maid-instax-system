"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog"

import { saveInstax } from "@/api/instax-save"

type Props = {
	imgData: FormData | null
	instaxId: number | string
	open?: boolean
	onOpenChange?: (open: boolean) => void
	onClose?: () => void
}

export default function SaveConfirmDialog({ imgData, instaxId, open, onOpenChange, onClose }: Props) {
	const router = useRouter()
	const [isSaving, setIsSaving] = useState(false)

	const handleSave = async () => {
        setIsSaving(true)
        try {
            // saveInstax は { instax_id, image_file } の形を期待する
            const req = {
                instax_id: Number(instaxId),
                image_file: imgData as FormData,
            }

			await saveInstax(req)
			// 親に閉じてもらう（onOpenChange を優先、なければ onClose）
			if (onOpenChange) onOpenChange(false)
			else onClose?.()
			// 保存成功後に /edit にリダイレクト
			router.push("/edit")
        } catch (err) {
        console.error("saveInstax error:", err)
        alert("保存に失敗しました。通信環境を確認して再度お試しください。")
    } finally {
        setIsSaving(false)
    }
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
			<DialogHeader>
				<DialogTitle>保存しますか？</DialogTitle>
				<DialogDescription>
					画像を保存してよろしいですか。保存後、編集一覧ページに戻ります。
				</DialogDescription>
			</DialogHeader>

			<div className="mt-2">
				{!imgData && (
					<p className="text-sm text-red-500">
						画像がまだ準備できていません。描画処理が終わるまで少しお待ちください。
					</p>
				)}
			</div>

			<DialogFooter>
				<button
					type="button"
					className="mr-2 inline-flex items-center rounded-md bg-gray-200 px-3 py-2 text-sm"
					onClick={() => onClose && onClose()}
					disabled={isSaving}
				>
					キャンセル
				</button>

				<button
					type="button"
					className="inline-flex items-center rounded-md bg-pink-300 px-3 py-2 text-sm text-black"
					onClick={handleSave}
					disabled={isSaving}
				>
					{isSaving ? "保存中..." : "保存する"}
				</button>
			</DialogFooter>

			{/* 右上の閉じるボタン（X） */}
			<DialogClose />
			</DialogContent>
		</Dialog>
	)
}

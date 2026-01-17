import Image from "next/image";
import type { BookshelfItem as Item } from "../type";
import { BookStatusBadge } from "./BookStatusBadge";

export function BookshelfItem({ item }: { item: Item }) {
  return (
    <li className="flex gap-4 p-4 bg-white rounded-lg shadow">
      <Image
        src={item.book.imageUrl}
        alt={item.book.title}
        width={80}
        height={112}
        className="rounded object-cover"
      />

      <div className="flex-1">
        <h3 className="font-semibold">{item.book.title}</h3>
        <p className="text-sm text-gray-500">{item.book.author}</p>

        <div className="mt-2">
          <BookStatusBadge status={item.status} />
        </div>
      </div>
    </li>
  );
}

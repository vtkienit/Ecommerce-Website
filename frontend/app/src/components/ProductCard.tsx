import clsx from "clsx";

type ProductCardProps = {
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  category?: string;
  numberSizes: number;
  numberColors: number;
  className?: string;
};

export default function ProductCard({
  image,
  title,
  price,
  originalPrice,
  discount,
  category,
  numberSizes,
  numberColors,
  className,
}: ProductCardProps) {
  return (
    <div
      className={clsx(
        "group cursor-pointer bg-bg rounded-md overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500",
        className
      )}
    >
      {/* IMAGE */}
      <div className="relative aspect-square">
        
        {/* Discount */}
        {discount && (
          <div className="absolute top-0 left-0 z-10 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-br-md shadow-lg">
            {discount}
          </div>
        )}

        {/* Image */}
        <img
          src={image}
          className="absolute w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 block pointer-events-none"
          alt={title}
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-2 px-3 py-4">
        
        {category && (
          <p className="text-sm md:text-base text-text-secondary font-semibold">
            {category}
          </p>
        )}

        <h3 className="text-base md:text-lg text-text font-semibold line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center gap-3">
          <span className="font-bold text-red-700 text-lg md:text-xl">
            ${price.toFixed(2)}
          </span>

          {originalPrice && (
            <span className="text-text-tertiary line-through text-sm md:text-base font-medium">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* TAGS */}
        <div className="flex flex-nowrap gap-2 mt-1 text-xs text-primary md:text-sm font-regular md:font-medium">
          
          <div className="px-1 py-0.5 md:px-2.5 md:py-1 whitespace-nowrap rounded-md bg-primary/8 truncate">
            {numberSizes} Kích thước
          </div>

          <div className="px-1 py-0.5 md:px-2.5 md:py-1 whitespace-nowrap rounded-md bg-primary/8 truncate">
            {numberColors} Màu sắc
          </div>

        </div>
      </div>
    </div>
  );
}
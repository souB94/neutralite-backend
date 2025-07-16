import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

import Footer from "../../components/Footer/Footer";
import InnerBanner from "../../components/InnerBanner/InnerBanner";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ProductCategory.css';


function ProductCategory() {
    const [allProducts, setAllProducts] = useState([]);
    const [loadingAllProducts, setLoadingAllProducts] = useState(true);
    const [errorAllProducts, setErrorAllProducts] = useState(null);

    const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

    const { cartItems, setCartItems } = useCart();
    const { wishlistItems, setWishlistItems } = useWishlist();

    const [bestSellerProducts, setBestSellerProducts] = useState([]);
    const [loadingBestSellers, setLoadingBestSellers] = useState(true);
    const [errorBestSellers, setErrorBestSellers] = useState(null);

    const [dynamicFilterOptions, setDynamicFilterOptions] = useState([]);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [errorFilters, setErrorFilters] = useState(null);

    const [activeFilterLabel, setActiveFilterLabel] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [minPriceFilter, setMinPriceFilter] = useState('');
    const [maxPriceFilter, setMaxPriceFilter] = useState('');
    const [selectedAvailability, setSelectedAvailability] = useState('');

    const [filteredProducts, setFilteredProducts] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const navigate = useNavigate();
    const productRestockTimers = useRef({}); // Use a ref to store and clear timers

    const handleViewProductDetails = (productId) => {
        navigate(`/product-details/${productId}`);
    };

    const [isFilterBarVisible, setFilterBarVisible] = useState(false);

    const toggleFilterBar = () => {
        setFilterBarVisible(!isFilterBarVisible);
    };

    const [sortOption, setSortOption] = useState('default');

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const addToCart = (productToAdd) => {
        const existingItem = cartItems.find(item => item._id === productToAdd._id);

        if (existingItem) {
            setCartItems(
                cartItems.map(item =>
                    item._id === productToAdd._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCartItems([...cartItems, { ...productToAdd, quantity: 1 }]);
        }
    };

    const addToWishlist = (productToAdd) => {
        const existingItem = wishlistItems.find(item => item._id === productToAdd._id);

        if (existingItem) {
            console.log("Product already in wishlist:", productToAdd.name);
        } else {
            setWishlistItems([...wishlistItems, { ...productToAdd, quantity: 1 }]);
        }
    };

    const handleFilterHeaderClick = (label) => {
        setActiveFilterLabel(prevLabel => (prevLabel === label ? null : label));
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setSelectedCategories(prevCategories => {
            const newCategories = new Set(prevCategories);
            if (checked) {
                newCategories.add(value);
            } else {
                newCategories.delete(value);
            }
            return newCategories;
        });
    };

    const handleMinPriceChange = (e) => {
        setMinPriceFilter(e.target.value);
    };

    const handleMaxPriceChange = (e) => {
        setMaxPriceFilter(e.target.value);
    };

    const handleAvailabilityChange = (e) => {
        const clickedValue = e.target.value;
        if (clickedValue === selectedAvailability) {
            setSelectedAvailability('');
        } else {
            setSelectedAvailability(clickedValue);
        }
    };


    // --- useEffect for fetching ALL Products ---
    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setLoadingAllProducts(true);
                const responseProducts = await fetch(`${backendUrl}/api/products`);
                if (!responseProducts.ok) throw new Error(`HTTP error! Status: ${responseProducts.status} for general products`);
                const generalProductsData = await responseProducts.json();

                const responsePersonalCare = await fetch(`${backendUrl}/api/personalProducts`);
                if (!responsePersonalCare.ok) throw new Error(`HTTP error! Status: ${responsePersonalCare.status} for personal care products`);
                const personalCareProductsData = await responsePersonalCare.json();

                const responseShopCategory = await fetch(`${backendUrl}/api/shopCategories`);
                if (!responseShopCategory.ok) throw new Error(`HTTP error! Status: ${responseShopCategory.status} for shop category products`);
                const shopCategoryProductsData = await responseShopCategory.json();

                const combinedProducts = [...generalProductsData, ...personalCareProductsData, ...shopCategoryProductsData];
                
                // Add a "newlyStocked" flag to products that just came in stock
                const updatedProducts = combinedProducts.map(newProduct => {
                  const oldProduct = allProducts.find(p => p._id === newProduct._id);
                  const justRestocked = oldProduct && oldProduct.stock === 0 && newProduct.stock > 0;
                  
                  // Set a timer to remove the "newlyStocked" flag after 24 hours
                  if (justRestocked) {
                    productRestockTimers.current[newProduct._id] = setTimeout(() => {
                      // This won't work directly because you can't update a single item in a large state array easily.
                      // The more correct approach is to handle this logic in the render function.
                    }, 24 * 60 * 60 * 1000); 
                    
                    // Instead of a timer, we'll simply add a timestamp to the product
                    return { ...newProduct, restockedAt: Date.now() };
                  }
                  
                  // Keep the restockedAt timestamp for existing products
                  if (oldProduct && oldProduct.restockedAt) {
                      return { ...newProduct, restockedAt: oldProduct.restockedAt };
                  }

                  return newProduct;
                });
                
                setAllProducts(updatedProducts);
            } catch (err) {
                console.error('Fetch All Products error:', err);
                setErrorAllProducts(err);
            } finally {
                setLoadingAllProducts(false);
            }
        };
        fetchAllProducts();
    }, [backendUrl,refreshTrigger]);


    // useEffect for filtering and sorting
    useEffect(() => {
        if (allProducts.length === 0 && !loadingAllProducts) {
            setFilteredProducts([]);
            return;
        }

        let tempFilteredProducts = [...allProducts];

        if (selectedAvailability === 'In stock') {
            tempFilteredProducts = tempFilteredProducts.filter(product => product.stock > 0);
        } else if (selectedAvailability === 'Out Of Stock') {
            tempFilteredProducts = tempFilteredProducts.filter(product => product.stock === 0);
        }

        const minPrice = parseFloat(minPriceFilter);
        const maxPrice = parseFloat(maxPriceFilter);

        tempFilteredProducts = tempFilteredProducts.filter(product => {
            const productPrice = parseFloat(product.price?.replace('$', ''));
            if (isNaN(productPrice)) return false;

            let passesMin = true;
            let passesMax = true;

            if (!isNaN(minPrice)) {
                passesMin = productPrice >= minPrice;
            }
            if (!isNaN(maxPrice)) {
                passesMax = productPrice <= maxPrice;
            }
            return passesMin && passesMax;
        });

        if (selectedCategories.size > 0) {
            tempFilteredProducts = tempFilteredProducts.filter(product =>
                product.category && selectedCategories.has(product.category.trim())
            );
        }

        if (sortOption === 'priceAsc') {
            tempFilteredProducts.sort((a, b) => parseFloat(a.price?.replace('$', '')) - parseFloat(b.price?.replace('$', '')));
        } else if (sortOption === 'priceDesc') {
            tempFilteredProducts.sort((a, b) => parseFloat(b.price?.replace('$', '')) - parseFloat(a.price?.replace('$', '')));
        } else if (sortOption === 'newest') {
            tempFilteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setFilteredProducts(tempFilteredProducts);
    }, [allProducts, selectedCategories, minPriceFilter, maxPriceFilter, selectedAvailability, loadingAllProducts, sortOption]);
    
    // Cleanup function for timers
    useEffect(() => {
        return () => {
            for (const timerId in productRestockTimers.current) {
                clearTimeout(productRestockTimers.current[timerId]);
            }
        };
    }, []);

    // Other useEffects (best sellers, filters) remain unchanged
    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                setLoadingBestSellers(true);
                const response = await fetch(`${backendUrl}/api/bestSellers`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setBestSellerProducts(data);
            } catch (err) {
                console.error('Fetch Best Sellers error:', err);
                setErrorBestSellers(err);
            } finally {
                setLoadingBestSellers(false);
            }
        };
        fetchBestSellers();
    }, [backendUrl]);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                setLoadingFilters(true);
                const response = await fetch(`${backendUrl}/api/filters`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setDynamicFilterOptions(data);
            } catch (err) {
                console.error('Error fetching filter options:', err);
                setErrorFilters(err);
            } finally {
                setLoadingFilters(false);
            }
        };
        fetchFilterOptions();
    }, [backendUrl]);

    // Helper function for rendering individual product cards
    const renderProductCard = (product) => {
        const isInCart = cartItems.some(item => item._id === product._id);
        const isInWishlist = wishlistItems.some(item => item._id === product._id);

        const defaultCartIconClasses = 'fi fi-rr-shopping-cart h-[24px]';
        const addedCartIconClasses = 'fi fi-ss-shopping-cart h-[24px]';
        const defaultWishlistIconClasses = 'fi fi-rr-heart h-[24px]';
        const addedWishlistIconClasses = 'fi fi-ss-heart h-[24px]';

        const finalCartIconClasses = isInCart ? addedCartIconClasses : defaultCartIconClasses;
        const finalWishlistIconClasses = isInWishlist ? addedWishlistIconClasses : defaultWishlistIconClasses;

        const isOutOfStock = product.stock === 0;
        
        // --- NEW LOGIC for newly stocked products ---
        const isNewlyStocked = product.restockedAt && (Date.now() - product.restockedAt < 24 * 60 * 60 * 1000);
        // --- END NEW LOGIC ---

        return (
            <div
                className={`product_box w-full sm:w-1/2 md:w-1/3 p-5 flex flex-col items-center
                ${isOutOfStock ? 'out-of-stock-product' : ''}
                ${isNewlyStocked ? 'newly-stocked-product' : ''}`}
                key={product._id}
            >
                {/* --- NEW: Conditionally render the "New" badge --- */}
                {isNewlyStocked && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full absolute top-2 left-2 z-10">
                        New!
                    </span>
                )}
                {/* --- END NEW LOGIC --- */}
                
                <div
                    className="product_img_wrapper bg-white border-1 border-gray-200 relative overflow-hidden shadow-md w-full max-w-[300px] h-[445px] flex items-center justify-center cursor-pointer"
                    onClick={() => handleViewProductDetails(product._id)}
                >
                    <div className='product_img_box flex items-center justify-center w-full h-full'>
                        <img
                            className='w-full h-full object-cover rounded-lg'
                            src={`${backendUrl}/uploads/${product.imageUrl}`}
                            alt={product.name || 'Product Image'}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x445/E0E0E0/808080?text=Image+Not+Found'; }}
                        />
                    </div>
                    <div className='floating_wishlist_cart_icon_group absolute'>
                        <div
                            className='wishlist_icon w-[50px] h-[50px] flex items-center justify-center cursor-pointer bg-cream-400 text-black text-[22px] mb-2'
                            onClick={(e) => {
                                e.stopPropagation();
                                addToWishlist(product);
                            }}
                        >
                            <i className={finalWishlistIconClasses}></i>
                        </div>
                    </div>
                    <button
                        className='buy_now_btn bg-cream-400 px-4 py-3 cursor-pointer uppercase tracking-widest font-urbanist text-[17px] font-medium text-black absolute bottom-0 left-0 w-full hover:bg-cream-500 transition-colors'
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                        }}
                    >
                        add to cart
                    </button>
                </div>
                <div className='product_text_wrapper text-wrapper mt-5 text-center w-full'>
                    <h3
                        className='product_title text-[22px] font-urbanist font-medium mb-1.5 cursor-pointer'
                        onClick={() => handleViewProductDetails(product._id)}
                    >
                        {product.name}
                    </h3>
                    <div className='rating_star flex items-center justify-center text-black gap-1.5 mb-1'>
                        {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fi ${i < parseInt(product.rating) ? 'fi-ss-star' : 'fi-ts-star'}`}></i>
                        ))}
                    </div>
                    <div className='product_price'>
                        <h4 className='font-bold font-urbanist text-[20px]'>{product.price}</h4>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <>
            <div className="main_content_wrapper" id="product_category">
                <InnerBanner />
                <section className='product_list_section py-10'>
                    <div className='container max-w-[1320px] mx-auto px-4'>
                        <div className='section_content_wrapper flex item-start justify-between overflow-visible'>
                            <div className={`filter_bar left w-[25%] pr-5 sticky top-10 z-2 self-start ${isFilterBarVisible ? 'showFilterBar' : ''}`}>
                                <h3 className='filter_block_header text-[22px] font-semibold border-b-2 border-black'>
                                    Filter <span className="icon_wrapper float-end close_filter_bar text-[12px] p-2 bg-brown-600 text-white cursor-pointer" onClick={toggleFilterBar}><i className="fi fi-br-cross flex"></i></span>
                                </h3>
                                <div className="filter_wrapper mt-5 min-h-auto mb-8">
                                    {loadingFilters ? (
                                        <div className="text-center w-full py-10"><p className="text-[18px] font-urbanist text-gray-700">Loading filters...</p></div>
                                    ) : errorFilters ? (
                                        <div className="text-center w-full py-10"><p className="text-[18px] font-urbanist text-red-600">Error loading filters: {errorFilters.message}</p></div>
                                    ) : dynamicFilterOptions.length === 0 ? (
                                        <div className="text-center w-full py-10"><p className="text-[18px] font-urbanist text-gray-700">No filter options available.</p></div>
                                    ) : (
                                        dynamicFilterOptions.map((block) => (
                                            <div
                                                key={block.label}
                                                className={`filter_options bg-cream-200 p-5 availability cursor-pointer transition duration-300 ease-in mb-2 ${activeFilterLabel === block.label ? 'show_options' : ''}`}
                                            >
                                                <h4
                                                    className="flex items-center justify-between text-[18px] font-medium"
                                                    onClick={() => handleFilterHeaderClick(block.label)}
                                                >
                                                    {block.label}
                                                    <span className="icon_wrapper">
                                                        <i className={`fi ${activeFilterLabel === block.label ? 'fi-rr-angle-small-down' : 'fi-rr-angle-small-up'} flex`}></i>
                                                    </span>
                                                </h4>
                                                <div className="option_content ">
                                                    <div className="block h-3"></div>
                                                    {block.type === 'checkbox' && block.options.map((opt) => (
                                                        <div className="options mb-2" key={opt.label}>
                                                            <label className="flex gap-2 relative">
                                                                <input
                                                                    type="checkbox"
                                                                    name={block.label.toLowerCase()}
                                                                    value={opt.label}
                                                                    className="w-[15px] h-[15px] transform translate-y-1"
                                                                    onChange={block.label === 'Availability' ? handleAvailabilityChange : handleCategoryChange}
                                                                    checked={
                                                                        block.label === 'Availability'
                                                                            ? selectedAvailability === opt.label
                                                                            : selectedCategories.has(opt.label)
                                                                    }
                                                                />
                                                                <p className="">{opt.label} (<span className="item_storck_no">{opt.quantity}</span>)</p>
                                                            </label>
                                                        </div>
                                                    ))}

                                                    {block.type === 'range' && (
                                                        <div className="price_range flex items-center gap-4">
                                                            <div className="flex flex-col">
                                                                <label htmlFor={`minPrice-${block.label}`} className="text-sm font-medium">Min</label>
                                                                <input
                                                                    type="number"
                                                                    id={`minPrice-${block.label}`}
                                                                    name="minPrice"
                                                                    className="border-2 bg-white mt-2 border-gray-500 px-2 py-1 w-24"
                                                                    placeholder={block.options[0].min}
                                                                    value={minPriceFilter}
                                                                    onChange={handleMinPriceChange}
                                                                />
                                                            </div>
                                                            <span className="font-semibold transform translate-y-3">-</span>
                                                            <div className="flex flex-col">
                                                                <label htmlFor={`maxPrice-${block.label}`} className="text-sm font-medium">Max</label>
                                                                <input
                                                                    type="number"
                                                                    id={`maxPrice-${block.label}`}
                                                                    name="maxPrice"
                                                                    className="border-2 bg-white mt-2 border-gray-500 px-2 py-1 w-24"
                                                                    placeholder={block.options[0].max}
                                                                    value={maxPriceFilter}
                                                                    onChange={handleMaxPriceChange}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="best_seller_block">
                                    <h3 className='filter_block_header text-[22px] font-semibold border-b-2 border-black'>
                                        Best Seller
                                    </h3>
                                    <div className="best_seller_product_slider">
                                        {loadingBestSellers ? (
                                            <div className="text-center w-full py-10"><p className="text-[22px] font-urbanist text-gray-700">Loading Best Seller Products...</p></div>
                                        ) : errorBestSellers ? (
                                            <div className="text-center w-full py-10"><p className="text-[22px] font-urbanist text-red-600">Error loading Best Seller Products: {errorBestSellers.message}</p></div>
                                        ) : bestSellerProducts.length === 0 ? (
                                            <div className="text-center w-full py-10"><p className="text-[22px] font-urbanist text-gray-700">No Best Seller Products found.</p></div>
                                        ) : (
                                            <Swiper
                                                modules={[Navigation, Autoplay]}
                                                spaceBetween={0}
                                                slidesPerView={1}
                                                navigation={true}
                                                autoplay={{
                                                    delay: 5000,
                                                    disableOnInteraction: true,
                                                }}
                                                loop={true}
                                                className="w-full"
                                            >
                                                {bestSellerProducts.map((product) => (
                                                    <SwiperSlide key={product._id}>
                                                        <a href={`/product-details/${product._id}`} className="product_box w-full p-2"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleViewProductDetails(product._id);
                                                            }}
                                                        >
                                                            <div className="product_img_wrapper bg-white border-1 border-gray-200 relative overflow-hidden">
                                                                <div className='product_img_box flex items-center justify-center'>
                                                                    <img
                                                                        className='w-[200px] h-[300px] object-cover'
                                                                        src={`${backendUrl}/uploads/${product.imageUrl}`}
                                                                        alt={product.name || 'Product Image'}
                                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x300/E0E0E0/808080?text=Image+Not+Found'; }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className='product_text_wrapper text-wrapper mt-5 text-center'>
                                                                <h3 className='product_title text-[22px] font-urbanist font-medium mb-1.5'>{product.name}</h3>
                                                                <div className='rating_star flex items-center justify-center text-black gap-1.5 mb-1'>
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <i key={i} className={`fi ${i < parseInt(product.rating) ? 'fi-ss-star' : 'fi-rr-star'}`}></i>
                                                                    ))}
                                                                </div>
                                                                <div className='product_price'>
                                                                    <h4 className='font-bold font-urbanist text-[20px]'>{product.price}</h4>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="product_box_wrapper right w-[75%] pl-5">
                                <div className="top_sort_bar py-3 px-5 bg-cream-250">
                                    <div className="inner_content_wrapper flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-[16px]">Showing {filteredProducts.length} results</p>
                                            <span className="icon_wrapper text-[12px] p-2 bg-brown-600 text-white cursor-pointer inline-block" onClick={toggleFilterBar}>
                                                <i className="fi fi-rr-filter flex"></i>
                                            </span>
                                        </div>
                                        <div className="sort_by_wrap flex items-center">
                                            <p className="font-medium text-[16px] mr-2">Sort by:</p>
                                            <select
                                                name="sort_products"
                                                id="sort_products"
                                                className="bg-white border border-gray-400 py-1 px-2 text-sm"
                                                value={sortOption}
                                                onChange={handleSortChange}
                                            >
                                                <option value="default">Default</option>
                                                <option value="priceAsc">Price: Low to High</option>
                                                <option value="priceDesc">Price: High to Low</option>
                                                <option value="newest">Newest</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="product_grid_wrapper pt-5 flex flex-wrap -m-5">
                                    {loadingAllProducts ? (
                                        <div className="text-center w-full py-10"><p className="text-[22px] font-urbanist text-gray-700">Loading products...</p></div>
                                    ) : errorAllProducts ? (
                                        <div className="text-center w-full py-10"><p className="text-[22px] font-urbanist text-red-600">Error loading products: {errorAllProducts.message}</p></div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="text-center w-full py-10"><p className="text-[22px] font-urbanist text-gray-700">No products match your filters.</p></div>
                                    ) : (
                                        filteredProducts.map(renderProductCard)
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        </>
    );
}

export default ProductCategory;
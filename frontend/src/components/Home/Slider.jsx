import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSwipeable } from "react-swipeable";

const Slider = () => {
    const navigate = useNavigate();
    const data = [
        {
            _id: "1",
            name: "John Doe",
            age: 28,
            city: "New York",
            state: "NY",
            phone: "123-456-7890",
            picture: "https://picsum.photos/300/200?random=1",
        },
        {
            _id: "2",
            name: "Jane Smith",
            age: 34,
            city: "Los Angeles",
            state: "CA",
            phone: "987-654-3210",
            picture: "https://picsum.photos/300/200?random=2",
        },
        {
            _id: "3",
            name: "Jack Brown",
            age: 45,
            city: "Chicago",
            state: "IL",
            phone: "555-123-4567",
            picture: "https://picsum.photos/300/200?random=3",
        },
        {
            _id: "4",
            name: "Emily White",
            age: 22,
            city: "Miami",
            state: "FL",
            phone: "444-789-0123",
            picture: "https://picsum.photos/300/200?random=4",
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === data.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? data.length - 1 : prevIndex - 1
        );
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => nextSlide(),
        onSwipedRight: () => prevSlide(),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowLeft") {
                prevSlide();
            } else if (event.key === "ArrowRight") {
                nextSlide();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleImageClick = (id) => {
        // Redirect to the route corresponding to the item id
        navigate(`/id`);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="relative overflow-hidden" {...handlers} ref={carouselRef}>
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {data.map((item) => (
                        <div
                            key={item._id}
                            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0 px-2"
                            aria-label={`Item: ${item.name}`}
                        >
                            <div className="flex flex-col items-center justify-center">
                                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-yellow-500">
                                    <img
                                        src={item.picture}
                                        alt={item.name}
                                        className="w-full h-40 object-cover"
                                        onClick={() => handleImageClick(item._id)} // Trigger route change
                                    />
                                    <div className="p-4 text-center">
                                        <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-yellow-500 rounded-full mb-2">
                                            {item.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 ml-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    aria-label="Previous slide"
                >
                    <FaChevronLeft className="text-gray-800" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    aria-label="Next slide"
                >
                    <FaChevronRight className="text-gray-800" />
                </button>
            </div>
        </div>
    );
};

export default Slider;

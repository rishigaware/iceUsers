import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSwipeable } from "react-swipeable";
import { useUser } from "../../../../context/UserContext";

const Slider = () => {
    const { url } = useUser();
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    const data = [
        {
            _id: "1",
            name: "John Doe",
            age: "25",
            city: "New York",
            state: "NY",
            phone: "123-456-7890",
            picture: "/uploads/lost/john.jpg",
            ticketStatus: "open"
        },
        {
            _id: "2",
            name: "Jane Smith",
            age: "30",
            city: "Los Angeles",
            state: "CA",
            phone: "987-654-3210",
            picture: "/uploads/lost/jane.jpg",
            ticketStatus: "open"
        },
        // Add more data items as necessary
    ];

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === data.length - 4 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? data.length - 4 : prevIndex - 1
        );
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => nextSlide(),
        onSwipedRight: () => prevSlide(),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
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

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="relative overflow-hidden" {...handlers} ref={carouselRef}>
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 25}%)` }}
                >
                    {data.map((item) => (
                        <div
                            key={item._id}
                            className="w-1/4 flex-shrink-0 px-2"
                            aria-label={`Blog item: ${item.name}`}
                        >
                            <div className="flex flex-col items-center justify-center">
                                <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-lg shadow-xl overflow-hidden transition-transform duration-300 hover:scale-105 border border-white border-opacity-10 focus-within:ring-2 focus-within:ring-primary">
                                    <img
                                        src={`${url}${item.picture}`}
                                        alt={item.name}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/400x200?text=Image';
                                          e.target.onerror = null;
                                        }}
                                    />
                                    <div className="p-4 text-center">
                                        <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-primary rounded-full mb-2">
                                            {item.name}
                                        </span>
                                        <p className="text-gray-300 text-sm">Age: {item.age || "Unknown"}</p>
                                        <p className="text-gray-300 text-sm">City: {item.city}</p>
                                        <p className="text-gray-300 text-sm">State: {item.state}</p>
                                        <p className="text-gray-300 text-sm">Contact Number: {item.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 ml-2 focus:outline-none focus:ring-2 focus:ring-primary border border-white border-opacity-20"
                    aria-label="Previous slide"
                >
                    <FaChevronLeft className="text-gray-800" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-primary border border-white border-opacity-20"
                    aria-label="Next slide"
                >
                    <FaChevronRight className="text-gray-800" />
                </button>
            </div>
        </div>
    );
};

export default Slider;

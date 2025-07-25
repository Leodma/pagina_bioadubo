document.addEventListener('DOMContentLoaded', () => {
    // Determine o caminho base para GitHub Pages ou desenvolvimento local
    // A lógica da tag <base href> já está no HTML, mas mantemos basePath para fetch()
    let basePath = '/';
    const repoName = 'pagina_bioadubo'; // Defina o nome do seu repositório aqui

    if (window.location.hostname.endsWith('github.io') || window.location.hostname === 'localhost') {
        if (window.location.pathname.startsWith('/' + repoName + '/')) {
            basePath = '/' + repoName + '/';
        }
    }

    // Existing header and footer loading logic, now using basePath
    // Ajustado o caminho para assumir que header.html está na raiz do projeto
    const headerPath = basePath + 'header.html';
    console.log('Tentando carregar o cabeçalho de:', headerPath); // Log para depuração
    fetch(headerPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ao carregar ${headerPath}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('header-placeholder').innerHTML = html;
            const headerLogo = document.getElementById('header-logo');
            if (headerLogo) {
                // O caminho da logo agora é relativo à base definida pela tag <base> no HTML
                // Se a tag <base> estiver funcionando, 'static/imagens/logo-horizontal.svg' será suficiente.
                // Caso contrário, use basePath + 'static/imagens/logo-horizontal.svg';
                headerLogo.src = 'static/imagens/logo-horizontal.svg';
                console.log('Caminho da logo definido para:', headerLogo.src);
            }
            // A função adjustHeaderLinks foi removida, pois a tag <base> cuida dos links HTML
        })
        .catch(error => console.error('Erro ao carregar o cabeçalho:', error));

    // Ajustado o caminho para assumir que footer.html está na raiz do projeto
    const footerPath = basePath + 'footer.html';
    console.log('Tentando carregar o rodapé de:', footerPath); // Log para depuração
    fetch(footerPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ao carregar ${footerPath}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('footer-placeholder').innerHTML = html;
            // A função adjustAllInternalLinks não é mais necessária aqui
        })
        .catch(error => console.error('Erro ao carregar o rodapé:', error));

    // Generic Carousel Functionality
    // This function can be reused for any carousel with the specified structure
    function setupCarousel(containerId, prevBtnId, nextBtnId) {
        const carousel = document.getElementById(containerId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);

        if (carousel && prevBtn && nextBtn) {
            // Calculate scroll amount based on the first item's width and margin
            const firstCarouselItem = carousel.querySelector('.carousel-item, .carousel-image-item');
            let scrollAmount = 0;

            const updateScrollAmount = () => {
                if (firstCarouselItem) {
                    const itemStyle = window.getComputedStyle(firstCarouselItem);
                    const marginRight = parseFloat(itemStyle.marginRight);
                    scrollAmount = firstCarouselItem.offsetWidth + marginRight;
                }
            };

            updateScrollAmount();
            window.addEventListener('resize', updateScrollAmount);

            prevBtn.addEventListener('click', () => {
                carousel.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });

            nextBtn.addEventListener('click', () => {
                carousel.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });

            // Optional: Hide/show arrows based on scroll position
            const updateArrowVisibility = () => {
                if (carousel.scrollLeft <= 0) {
                    prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }

                // Allow a small tolerance for floating point errors in scrollWidth/clientWidth
                if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1) {
                    nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            };

            carousel.addEventListener('scroll', updateArrowVisibility);
            // Initial check for arrow visibility
            updateArrowVisibility();
        }
    }

    // Setup for the main product carousel (from index.html)
    setupCarousel('carousel-container', 'prev-btn', 'next-btn');

    // Setup for "Before" images carousel
    setupCarousel('before-carousel-container', 'prev-before-btn', 'next-before-btn');

    // Setup for "After" images carousel
    setupCarousel('after-carousel-container', 'prev-after-btn', 'next-after-btn');


    // ApexCharts and Intersection Observer for animated graph
    // Load ApexCharts library dynamically
    const apexChartsScript = document.createElement('script');
    apexChartsScript.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
    apexChartsScript.onload = () => {
        // Map to keep track of initialized charts by their div ID
        const initializedCharts = new Map();

        // Find all chart divs on the page
        document.querySelectorAll('div[data-chart-config]').forEach(chartDiv => {
            const chartConfig = JSON.parse(chartDiv.dataset.chartConfig);
            const divId = chartDiv.id;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    // Check if the target is intersecting AND if this chart has NOT been initialized yet
                    if (entry.isIntersecting && !initializedCharts.has(divId)) {
                        const options = {
                            chart: {
                                type: chartConfig.type || 'bar', // Default to bar chart
                                height: chartConfig.height || 350,
                                animations: {
                                    enabled: true,
                                    easing: 'easeinout',
                                    speed: 800,
                                    animateGradually: {
                                        enabled: true,
                                        delay: 150
                                    },
                                    dynamicAnimation: {
                                        enabled: true,
                                        speed: 350
                                    }
                                },
                                toolbar: {
                                    show: false // Hide toolbar by default
                                }
                            },
                            series: chartConfig.series, // Data series
                            xaxis: {
                                categories: chartConfig.labels, // Use labels from chartConfig for X-axis categories
                                title: {
                                    text: chartConfig.xAxisTitle // X-axis title
                                }
                            },
                            yaxis: {
                                title: {
                                    text: chartConfig.yAxisTitle // Y-axis title
                                },
                                labels: {
                                    formatter: function (value) {
                                        let formattedValue = value;
                                        // Check valueUnit first for explicit unit
                                        if (chartConfig.valueUnit) {
                                            if (chartConfig.valueUnit === 'kg') {
                                                formattedValue = new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilogram', unitDisplay: 'short' }).format(value);
                                            } else if (chartConfig.valueUnit === '%') {
                                                formattedValue = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value / 100);
                                            } else if (chartConfig.valueUnit === 'cx') {
                                                formattedValue = `${value} cx`; // Manually append 'cx' for caixas
                                            } else if (chartConfig.valueUnit === 'R$') { // Preserve R$ formatter
                                                formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                                            }
                                            else {
                                                formattedValue = `${value} ${chartConfig.valueUnit}`; // For other custom units
                                            }
                                        } else if (chartConfig.yAxisTitle && (chartConfig.yAxisTitle.includes('kg/1000 m²') || chartConfig.yAxisTitle.includes('kg/ha') || (chartConfig.title && chartConfig.title.includes('Produção')))) {
                                            formattedValue = new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilogram', unitDisplay: 'short' }).format(value);
                                        } else if (chartConfig.yAxisTitle && chartConfig.yAxisTitle.includes('%')) {
                                            formattedValue = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value / 100);
                                        }
                                        return formattedValue;
                                    }
                                }
                            },
                            plotOptions: {
                                bar: {
                                    horizontal: false,
                                    columnWidth: '55%',
                                    endingShape: 'rounded',
                                    colors: { // Moved colors property here for individual bar coloring
                                        ranges: [{
                                            from: 0,
                                            to: 1000000, // A large number to cover all bar values
                                            color: undefined // This will be overridden by the chartConfig.colors array
                                        }]
                                    }
                                },
                            },
                            dataLabels: {
                                enabled: true,
                                formatter: function (val) {
                                    let formattedVal = val;
                                    // Check valueUnit first for explicit unit
                                    if (chartConfig.valueUnit) {
                                        if (chartConfig.valueUnit === 'kg') {
                                            formattedVal = new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilogram', unitDisplay: 'short' }).format(val);
                                        } else if (chartConfig.valueUnit === '%') {
                                            formattedVal = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val / 100);
                                        } else if (chartConfig.valueUnit === 'cx') {
                                            formattedVal = `${val} cx`; // Manually append 'cx' for caixas
                                        } else {
                                            formattedVal = `${val} ${chartConfig.valueUnit}`; // For other custom units
                                        }
                                    } else if (chartConfig.yAxisTitle && chartConfig.yAxisTitle.includes('%')) {
                                        formattedVal = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val / 100);
                                    } else if (chartConfig.yAxisTitle && (chartConfig.yAxisTitle.includes('kg/1000 m²') || chartConfig.yAxisTitle.includes('kg/ha') || (chartConfig.title && chartConfig.title.includes('Produção')))) { // Added chartConfig.title.includes('Produção')
                                        formattedVal = new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'kilogram', unitDisplay: 'short' }).format(val);
                                    }
                                    return formattedVal;
                                }
                            },
                            colors: chartConfig.colors || ['#36454F', '#4CAF50'], // This will be used by the fill property below
                            fill: {
                                opacity: 0.9 // Ensure opacity is not zero
                            },
                            legend: {
                                show: chartConfig.showLegend !== false, // Show legend by default
                                position: 'top',
                            },
                            title: {
                                text: chartConfig.title, // Chart title
                                align: 'center'
                            }
                        };

                        // Dynamically set colors for individual bars if provided in chartConfig.colors
                        if (chartConfig.colors && chartConfig.colors.length > 0) {
                            options.plotOptions.bar.colors.ranges = chartConfig.colors.map((color, index) => ({
                                from: chartConfig.series[0].data[index], // Use the data value as 'from' for range
                                to: chartConfig.series[0].data[index],   // Use the data value as 'to' for range
                                color: color
                            }));
                            // If there are more colors than data points, or if the range logic is complex,
                            // ApexCharts might need a simpler direct color array for the series.
                            // Let's try setting colors directly at the top level for the series.
                            options.colors = chartConfig.colors; // Keep this here for series-level coloring
                        }


                        const chart = new ApexCharts(chartDiv, options);
                        chart.render(); // Render the chart
                        initializedCharts.set(divId, true); // Mark this chart as initialized
                        observer.unobserve(entry.target); // Stop observing this div once the chart is created
                    }
                });
            }, { threshold: 0.5 }); // Trigger when 50% of the element is visible

            observer.observe(chartDiv); // Start observing the chart div
        });
    };
    document.head.appendChild(apexChartsScript); // Append ApexCharts script to head

    // Logic for Image Modal
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Open modal when an image with 'open-modal-trigger' class is clicked
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('open-modal-trigger')) {
            const fullSrc = event.target.dataset.fullSrc || event.target.src; // Use data-full-src or fallback to src
            modalImage.src = fullSrc;
            imageModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden'); // Prevent scrolling behind modal
        }
    });

    // Close modal when close button is clicked
    closeModalBtn.addEventListener('click', () => {
        imageModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    });

    // Close modal when clicking outside the image (on the overlay)
    imageModal.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            imageModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });

    // Close modal when Escape key is pressed
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !imageModal.classList.contains('hidden')) {
            imageModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });
});

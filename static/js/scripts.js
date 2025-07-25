// script.js

// Função para carregar e inserir o cabeçalho
async function loadHeader() {
    try {
        // Caminho relativo a partir de scripts.js para a raiz do projeto
        const headerPath = '../../header.html'; 
        const response = await fetch(headerPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const headerHtml = await response.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;
        // Chamar a função de configuração do menu mobile APÓS o cabeçalho ser carregado
        setupMobileMenu();
    } catch (error) {
        console.error('Erro ao carregar o cabeçalho:', error);
    }
}

// Função para carregar e inserir o rodapé
async function loadFooter() {
    try {
        // Caminho relativo a partir de scripts.js para a raiz do projeto
        const footerPath = '../../footer.html';
        const response = await fetch(footerPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const footerHtml = await response.text();
        document.getElementById('footer-placeholder').innerHTML = footerHtml;
    } catch (error) {
        console.error('Erro ao carregar o rodapé:', error);
    }
}

// Função para configurar o menu mobile
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Função genérica para renderizar ApexCharts
function renderApexChart(chartElement) {
    if (!chartElement) return;

    const chartConfig = JSON.parse(chartElement.dataset.chartConfig);

    const options = {
        series: chartConfig.series,
        chart: {
            type: chartConfig.type,
            height: chartConfig.height,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: chartConfig.labels,
            labels: {
                style: {
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    colors: '#4B5563' // gray-700
                }
            }
        },
        yaxis: {
            title: {
                text: chartConfig.yAxisTitle,
                style: {
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    color: '#4B5563'
                }
            },
            labels: {
                formatter: function (value) {
                    return value + chartConfig.valueUnit;
                },
                style: {
                    fontFamily: 'Inter, sans-serif',
                    colors: '#4B5563'
                }
            }
        },
        fill: {
            opacity: 1,
            colors: chartConfig.colors
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + chartConfig.valueUnit;
                }
            }
        },
        title: {
            text: chartConfig.title,
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                fontFamily: 'Inter, sans-serif',
                color: '#1F2937' // gray-900
            }
        }
    };

    const chart = new ApexCharts(chartElement, options);
    chart.render();
}

// Função genérica para configurar carrosséis
function setupCarousel(containerId, prevBtnId, nextBtnId) {
    const carousel = document.getElementById(containerId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (carousel && prevBtn && nextBtn) {
        const updateScrollAmount = () => {
            const firstItem = carousel.querySelector('.carousel-image-item');
            if (firstItem) {
                const itemStyle = window.getComputedStyle(firstItem);
                const marginRight = parseFloat(itemStyle.marginRight) || 0;
                return firstItem.offsetWidth + marginRight;
            }
            return 0;
        };

        let scrollAmount = updateScrollAmount();
        window.addEventListener('resize', () => {
            scrollAmount = updateScrollAmount();
            updateArrowVisibility();
        });

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

        const updateArrowVisibility = () => {
            if (carousel.scrollLeft <= 0) {
                prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }

            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1) {
                nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        };
        carousel.addEventListener('scroll', updateArrowVisibility);
        updateArrowVisibility(); // Initial check
    }
}


// Chama as funções para carregar o cabeçalho, rodapé, gráficos e carrosséis quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadFooter();

    // Renderiza todos os gráficos ApexCharts na página
    document.querySelectorAll('[data-chart-config]').forEach(chartElement => {
        renderApexChart(chartElement);
    });

    // Configura os carrosséis em todas as páginas de case
    setupCarousel('before-carousel-container', 'prev-before-btn', 'next-before-btn');
    setupCarousel('after-carousel-container', 'prev-after-btn', 'next-after-btn');
});

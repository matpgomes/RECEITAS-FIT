import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000/home", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on the 'Brownie Fit de Cacau' recipe card to open the recipe detail page.
        frame = context.pages[-1]
        # Click on the 'Brownie Fit de Cacau' recipe card to open the recipe detail page.
        elem = frame.locator('xpath=html/body/div[2]/main/div/div[4]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Próximo' button to navigate to the preparation mode slide.
        frame = context.pages[-1]
        # Click the 'Próximo' button to navigate to the preparation mode slide.
        elem = frame.locator('xpath=html/body/div[2]/main/div/div[6]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Próximo' button to navigate to the next slide and verify content and smooth transition.
        frame = context.pages[-1]
        # Click the 'Próximo' button to navigate to the next slide.
        elem = frame.locator('xpath=html/body/div[2]/main/div/div[6]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Próximo' button to navigate to step 2 of the step-by-step instructions and verify content and smooth transition.
        frame = context.pages[-1]
        # Click the 'Próximo' button to navigate to step 2 of the step-by-step instructions.
        elem = frame.locator('xpath=html/body/div[2]/main/div/div[6]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Próximo' button to navigate to step 3 of the step-by-step instructions and verify content and smooth transition.
        frame = context.pages[-1]
        # Click the 'Próximo' button to navigate to step 3 of the step-by-step instructions.
        elem = frame.locator('xpath=html/body/div[2]/main/div/div[6]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Próximo' button to navigate to step 4 of the step-by-step instructions and verify content and smooth transition.
        frame = context.pages[-1]
        # Click the 'Próximo' button to navigate to step 4 of the step-by-step instructions.
        elem = frame.locator('xpath=html/body/div[2]/main/div/div[6]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Brownie Fit de Cacau').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Brownie delicioso e saudável, sem culpa! Feito com cacau 100% e adoçante natural.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=35 minutos').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=8 porções').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=120 cal (economiza 230 cal)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=fit').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=chocolate').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=sem açúcar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=low carb').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Passo 4 de 4').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Passo 4').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=30 min').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Asse').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Despeje em forma untada e asse a 180°C por 25-30 minutos. Faça o teste do palito.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    
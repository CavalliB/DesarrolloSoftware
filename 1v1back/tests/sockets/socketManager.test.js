import { jest } from '@jest/globals'

jest.unstable_mockModule('../../Supabase.js', () => ({
    supabase: {
        from: jest.fn()
    }
}))

const { generateRandomLevel, updateUsuarioStats } =
    await import('../../sockets/socketManager.js')

const { supabase } =
    await import('../../Supabase.js')

describe('socketManager helpers', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('generateRandomLevel', () => {

        test('genera una matriz 16x16 y colores', () => {
            const { matrix, selectedColors } = generateRandomLevel()

            expect(matrix.length).toBe(16)
            expect(matrix[0].length).toBe(16)
            expect(selectedColors.length).toBeGreaterThan(0)
        })

    })

    describe('updateUsuarioStats', () => {

    test('actualiza estadísticas del usuario ganador', async () => {
        supabase.from
            .mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [{ PartidaTotal: 2, PartidaGanada: 1 }],
                        error: null
                    })
                })
            })
            .mockReturnValueOnce({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null })
                })
            })

        await updateUsuarioStats(1, true)

        expect(supabase.from).toHaveBeenCalledWith('Usuario')
    })

})
})

